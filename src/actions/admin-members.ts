"use server";

import { revalidatePath, unstable_noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function getMembers(
  search: string = "",
  status: string = "all",
  page: number = 1,
  limit: number = 10
) {
  unstable_noStore();
  try {
    const whereClause: any = {
      status: {
        in: ["ACTIVE", "INACTIVE", "SUSPENDED"]
      }
    };

    if (status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { nim: { contains: search, mode: "insensitive" } },
      ];
    }

    const totalCount = await prisma.memberProfile.count({
      where: whereClause,
    });

    const members = await prisma.memberProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: members,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching members:", error);
    return { data: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
}

export async function updateMemberStatus(
  id: string, 
  newStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED", 
) {
  try {
    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) throw new Error("Member not found");

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
    return { success: true };
  } catch (error: any) {
    console.error("Error updating member status:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMember(id: string) {
  try {
    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) throw new Error("Member not found");

    await prisma.user.delete({
      where: { id: profile.userId },
    });

    revalidatePath("/admin/members");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting member:", error);
    return { success: false, error: error.message };
  }
}

// Tambahkan member langsung, bypass PENDING
export async function createMember(formData: any) {
  try {
    // 1. Cek apakah email atau NIK sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar." };
    }

    const existingProfile = await prisma.memberProfile.findUnique({
      where: { nim: formData.nim },
    });

    if (existingProfile) {
      return { success: false, error: "NIM sudah terdaftar." };
    }

    if (formData.fotoKTMHash) {
      const existingKtp = await prisma.memberProfile.findUnique({
        where: { ktmHash: formData.fotoKTMHash }
      });
      if (existingKtp) {
        return { success: false, error: "Foto KTM ini sudah pernah digunakan oleh pendaftar lain." };
      }
    }

    if (formData.pasFotoHash) {
      const existingPhoto = await prisma.memberProfile.findUnique({
        where: { photoHash: formData.pasFotoHash }
      });
      if (existingPhoto) {
        return { success: false, error: "Pas Foto ini sudah pernah digunakan oleh pendaftar lain." };
      }
    }

    // Hash password (default: 123456)
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Save to Database
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: formData.namaLengkap,
          email: formData.email,
          password: hashedPassword,
          role: "MEMBER",
          status: "ACTIVE", // Langsung aktif
        },
      });

      await tx.memberProfile.create({
        data: {
          userId: user.id,
          nim: formData.nim,
          phoneNumber: formData.noTelepon,
          placeOfBirth: formData.tempatLahir,
          dateOfBirth: new Date(formData.tanggalLahir),
          gender: formData.jenisKelamin,
          address: formData.alamat,
          faculty: formData.fakultas,
          major: formData.jurusan,
          batchYear: formData.angkatan,
          status: "ACTIVE", // Langsung aktif
          photoUrl: formData.pasFotoUrl || "",
          ktmImageUrl: formData.fotoKTMUrl || "",
          ktmHash: formData.fotoKTMHash || null,
          photoHash: formData.pasFotoHash || null,
        },
      });
    });

    revalidatePath("/admin/members");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating member:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat menyimpan data." };
  }
}

export async function updateMember(id: string, data: { phoneNumber: string, address: string, faculty: string, major: string, batchYear: string }) {
  try {
    const profile = await prisma.memberProfile.findUnique({
      where: { id },
    });

    if (!profile) throw new Error("Member not found");

    await prisma.memberProfile.update({
      where: { id },
      data: {
        phoneNumber: data.phoneNumber,
        address: data.address,
        faculty: data.faculty,
        major: data.major,
        batchYear: data.batchYear,
      },
    });

    revalidatePath("/admin/members");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating member:", error);
    return { success: false, error: error.message || "Gagal memperbarui data member." };
  }
}
