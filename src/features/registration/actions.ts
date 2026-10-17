"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIp } from "@/lib/request";
import { memberRegistrationSchema, type MemberRegistrationInput } from "@/features/members/schemas";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { uploadImage } from "@/lib/storage";
import { logger } from "@/lib/logger";

export async function checkDuplicateRegistration(nim: string, email: string, ktmHash?: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.status !== "INACTIVE") {
      return { isDuplicate: true, error: "Email ini sudah terdaftar di sistem. Silakan gunakan email lain." };
    }

    const existingProfile = await prisma.memberProfile.findUnique({
      where: { nim },
    });

    if (existingProfile && existingProfile.status !== "REJECTED") {
      return { isDuplicate: true, error: "NIM ini sudah terdaftar. Anda tidak dapat mendaftar dua kali." };
    }

    if (ktmHash) {
      const existingKtm = await prisma.memberProfile.findUnique({
        where: { ktmHash },
      });

      if (existingKtm) {
        return { isDuplicate: true, error: "Foto KTM ini sudah pernah digunakan oleh pendaftar lain." };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    logger.error("Error checking duplicate registration:", error);
    return { isDuplicate: true, error: "Gagal memverifikasi data karena gangguan sistem. Silakan coba lagi." };
  }
}

export async function getRegistrationQuotaCount() {
  try {
    const count = await prisma.memberProfile.count({
      where: {
        status: {
          not: "REJECTED"
        }
      }
    });
    return { count };
  } catch (error) {
    logger.error("Error counting quota:", error);
    return { count: 0 };
  }
}

function buildMemberProfileData(
  data: MemberRegistrationInput,
  photoUrl?: string,
  ktmImageUrl?: string
) {
  return {
    phoneNumber: data.noTelepon,
    placeOfBirth: data.tempatLahir,
    dateOfBirth: new Date(data.tanggalLahir),
    gender: data.jenisKelamin,
    address: data.alamat,
    faculty: data.fakultas,
    major: data.jurusan,
    batchYear: data.angkatan,
    status: "PENDING" as const,
    photoUrl: photoUrl || data.pasFotoBase64 || "",
    ktmImageUrl: ktmImageUrl || data.fotoKTMBase64 || "",
  };
}

export async function submitRegistration(formData: FormData) {
  try {
    const rawData = {
      namaLengkap: formData.get("namaLengkap"),
      nim: formData.get("nim"),
      email: formData.get("email"),
      noTelepon: formData.get("noTelepon"),
      tempatLahir: formData.get("tempatLahir"),
      tanggalLahir: formData.get("tanggalLahir"),
      jenisKelamin: formData.get("jenisKelamin"),
      alamat: formData.get("alamat"),
      fakultas: formData.get("fakultas"),
      jurusan: formData.get("jurusan"),
      angkatan: formData.get("angkatan"),
      pasFotoBase64: formData.get("pasFotoBase64") || undefined,
      fotoKTMBase64: formData.get("fotoKTMBase64") || undefined,
    };

    const parsedResult = memberRegistrationSchema.safeParse(rawData);
    
    // 0. Cek Validasi Input (Backend Security Bypass Check)
    if (!parsedResult.success) {
      logger.warn("Pendaftaran validation error:", parsedResult.error.format());
      return { 
        success: false, 
        error: "Data pendaftaran tidak valid! Pastikan semua kolom terisi dengan benar." 
      };
    }
    const parsed = parsedResult.data;

    // 0.1 Rate Limiting (Maks 3 request per 10 menit)
    const ip = await getClientIp();
    const [byIp, byEmail] = await Promise.all([
      checkRateLimit(`register_ip_${ip}`, 3, 10 * 60 * 1000),
      checkRateLimit(`register_email_${parsed.email}`, 3, 10 * 60 * 1000),
    ]);

    if (!byIp.success || !byEmail.success) {
      return { success: false, error: "Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti." };
    }

    // 0.2 Turnstile Validation
    const turnstileToken = formData.get("turnstileToken") as string;
    if (!turnstileToken) {
      return { success: false, error: "Validasi keamanan gagal. Pastikan Anda bukan robot." };
    }
    
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!isTurnstileValid) {
      return { success: false, error: "Validasi keamanan (CAPTCHA) gagal. Silakan muat ulang halaman." };
    }

    // 1. Ambil Setting Kuota & Eksekusi Transaksi yang Aman (Transaction)
    const quotaSetting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEYS.REG_MAX_QUOTA }
    });
    const maxQuota = quotaSetting && quotaSetting.value ? parseInt(quotaSetting.value) : 0;

    // 2. Cek Duplikasi dulu di luar transaksi agar cepat
    const duplicateCheck = await checkDuplicateRegistration(parsed.nim, parsed.email);
    if (duplicateCheck.isDuplicate) {
      return { success: false, error: duplicateCheck.error };
    }

    // 3. Upload gambar ke Cloudinary jika dikonfigurasi (fallback otomatis jika belum)
    let photoUrl = parsed.pasFotoBase64 || "";
    let ktmImageUrl = parsed.fotoKTMBase64 || "";
    try {
      const [uploadedPhoto, uploadedKtm] = await Promise.all([
        uploadImage(parsed.pasFotoBase64, "photos"),
        uploadImage(parsed.fotoKTMBase64, "ktm"),
      ]);
      if (uploadedPhoto) photoUrl = uploadedPhoto;
      if (uploadedKtm) ktmImageUrl = uploadedKtm;
    } catch (uploadError) {
      logger.warn("Gagal upload gambar ke Cloudinary, fallback base64 digunakan", { error: String(uploadError) });
    }

    // 4. Simpan ke Database menggunakan TRANSACTION
    await prisma.$transaction(async (tx) => {
      if (maxQuota > 0) {
        const currentCount = await tx.memberProfile.count({
          where: { status: { not: "REJECTED" } }
        });

        if (currentCount >= maxQuota) {
          throw new Error("QUOTA_FULL");
        }
      }

      const existingRejectedProfile = await tx.memberProfile.findUnique({
        where: { nim: parsed.nim },
        include: { user: true }
      });

      const profilePayload = buildMemberProfileData(parsed, photoUrl, ktmImageUrl);

      if (existingRejectedProfile && existingRejectedProfile.status === "REJECTED") {
        await tx.user.update({
          where: { id: existingRejectedProfile.userId },
          data: {
            name: parsed.namaLengkap,
            email: parsed.email,
            status: "ACTIVE"
          }
        });
        await tx.memberProfile.update({
          where: { nim: parsed.nim },
          data: {
            ...profilePayload,
            adminNotes: null
          }
        });
      } else {
        const user = await tx.user.create({
          data: {
            name: parsed.namaLengkap,
            email: parsed.email,
            role: "MEMBER",
            status: "ACTIVE"
          }
        });

        await tx.memberProfile.create({
          data: {
            userId: user.id,
            nim: parsed.nim,
            ...profilePayload,
          }
        });
      }
    });

    return { success: true };

  } catch (error) {
    logger.error("Error submitting registration:", error);
    if (error instanceof Error && error.message === "QUOTA_FULL") {
      return { 
        success: false, 
        error: "Mohon maaf, Anda kurang cepat. Sisa kuota baru saja diisi oleh pendaftar lain sedetik yang lalu." 
      };
    }
    return { success: false, error: "Terjadi kesalahan internal pada server saat menyimpan data." };
  }
}
