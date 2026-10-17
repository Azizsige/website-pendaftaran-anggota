"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { requireSuperAdmin, requireRole } from "@/lib/auth/guards";
import { safeAction, ok, fail } from "@/lib/action-result";
import type { MemberStatus } from "@/lib/constants/status";
import { uploadImage } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { memberRegistrationSchema, updateMemberSchema, type UpdateMemberInput } from "./schemas";

export async function updateMemberStatus(
  id: string,
  newStatus: Extract<MemberStatus, "ACTIVE" | "INACTIVE" | "SUSPENDED">
) {
  await requireSuperAdmin();

  return safeAction("updateMemberStatus", async () => {
    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) return fail("Member tidak ditemukan.");

    await prisma.$transaction(async (tx) => {
      // Update MemberProfile
      await tx.memberProfile.update({
        where: { id },
        data: {
          status: newStatus,
        },
      });

      // Update User based on status
      if (newStatus === "ACTIVE") {
        await tx.user.update({
          where: { id: profile.userId },
          data: {
            status: "ACTIVE",
          },
        });
      } else if (newStatus === "INACTIVE" || newStatus === "SUSPENDED") {
        await tx.user.update({
          where: { id: profile.userId },
          data: {
            status: "INACTIVE",
          },
        });
      }
    });

    revalidatePath("/admin/members");
    return ok();
  });
}

export async function deleteMember(id: string) {
  await requireSuperAdmin();

  return safeAction("deleteMember", async () => {
    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) return fail("Member tidak ditemukan.");

    await prisma.user.delete({
      where: { id: profile.userId },
    });

    revalidatePath("/admin/members");
    return ok();
  });
}

// Tambahkan member langsung, bypass PENDING
export async function createMember(formData: Record<string, unknown>) {
  await requireSuperAdmin();

  return safeAction("createMember", async () => {
    // 0. Validasi Input dengan Zod
    const parsed = memberRegistrationSchema.parse(formData);

    // 1. Cek apakah email atau NIM sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existingUser) {
      return fail("Email sudah terdaftar.");
    }

    const existingProfile = await prisma.memberProfile.findUnique({
      where: { nim: parsed.nim },
    });

    if (existingProfile) {
      return fail("NIM sudah terdaftar.");
    }

    if (parsed.fotoKTMHash) {
      const existingKtp = await prisma.memberProfile.findUnique({
        where: { ktmHash: parsed.fotoKTMHash },
      });
      if (existingKtp) {
        return fail("Foto KTM ini sudah pernah digunakan oleh pendaftar lain.");
      }
    }

    if (parsed.pasFotoHash) {
      const existingPhoto = await prisma.memberProfile.findUnique({
        where: { photoHash: parsed.pasFotoHash },
      });
      if (existingPhoto) {
        return fail("Pas Foto ini sudah pernah digunakan oleh pendaftar lain.");
      }
    }

    // Generate random password
    const randomPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Upload foto dan KTM ke Cloudinary jika dikonfigurasi
    const rawPhoto = (formData.pasFotoUrl as string) || (formData.pasFotoBase64 as string) || "";
    const rawKtm = (formData.fotoKTMUrl as string) || (formData.fotoKTMBase64 as string) || "";
    let photoUrl = rawPhoto;
    let ktmImageUrl = rawKtm;
    try {
      const [uploadedPhoto, uploadedKtm] = await Promise.all([
        uploadImage(rawPhoto, "photos"),
        uploadImage(rawKtm, "ktm"),
      ]);
      if (uploadedPhoto) photoUrl = uploadedPhoto;
      if (uploadedKtm) ktmImageUrl = uploadedKtm;
    } catch (uploadError) {
      logger.warn("Gagal upload gambar ke Cloudinary di createMember, fallback base64 digunakan", { error: String(uploadError) });
    }

    // Save to Database
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.namaLengkap,
          email: parsed.email,
          password: hashedPassword,
          role: "MEMBER",
          status: "ACTIVE", // Langsung aktif
        },
      });

      await tx.memberProfile.create({
        data: {
          userId: user.id,
          nim: parsed.nim,
          phoneNumber: parsed.noTelepon,
          placeOfBirth: parsed.tempatLahir,
          dateOfBirth: new Date(parsed.tanggalLahir),
          gender: parsed.jenisKelamin,
          address: parsed.alamat,
          faculty: parsed.fakultas,
          major: parsed.jurusan,
          batchYear: parsed.angkatan,
          status: "ACTIVE", // Langsung aktif
          photoUrl: photoUrl || "",
          ktmImageUrl: ktmImageUrl || "",
          ktmHash: parsed.fotoKTMHash || null,
          photoHash: parsed.pasFotoHash || null,
        },
      });
    });

    revalidatePath("/admin/members");
    return ok({ generatedPassword: randomPassword });
  });
}

export async function updateMember(
  id: string,
  data: UpdateMemberInput
) {
  await requireRole(["OWNER", "SUPER_ADMIN", "COORDINATOR"]);

  return safeAction(
    "updateMember",
    async () => {
      const validated = updateMemberSchema.parse(data);

      const profile = await prisma.memberProfile.findUnique({
        where: { id },
      });

      if (!profile) return fail("Member tidak ditemukan.");

      await prisma.memberProfile.update({
        where: { id },
        data: {
          phoneNumber: validated.phoneNumber,
          address: validated.address,
          faculty: validated.faculty,
          major: validated.major,
          batchYear: validated.batchYear,
        },
      });

      revalidatePath("/admin/members");
      return ok();
    },
    "Gagal memperbarui data member."
  );
}
