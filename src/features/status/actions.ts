"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIp } from "@/lib/request";
import { computeKtaVerificationCode } from "@/lib/kta-verification";
import { getRejectionHistoryForProfile } from "@/lib/rejection-history";
import {
  expireElapsedSuspensions,
  getSuspendedUntilForProfile,
} from "@/lib/status-history";
import { uploadImage } from "@/lib/storage";
import { logger } from "@/lib/logger";

export async function checkRegistrationStatus(nim: string, email: string, turnstileToken: string) {
  try {
    // 1. Rate Limiting – gabungkan IP + NIM supaya rate limit tidak bisa dihindari
    //    hanya dengan mengganti IP (spoof header).
    const ip = await getClientIp();
    const [byIp, byNim] = await Promise.all([
      checkRateLimit(`status_ip_${ip}`, 10, 5 * 60 * 1000),
      checkRateLimit(`status_nim_${nim}`, 15, 5 * 60 * 1000),
    ]);

    if (!byIp.success || !byNim.success) {
      return { success: false, message: "Terlalu banyak percobaan pencarian. Silakan coba lagi nanti." };
    }

    // 2. Turnstile Validation
    if (!turnstileToken) {
      return { success: false, message: "Validasi keamanan gagal. Pastikan Anda bukan robot." };
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!isTurnstileValid) {
      return { success: false, message: "Validasi keamanan (CAPTCHA) gagal. Silakan muat ulang halaman." };
    }

    // Cari member berdasarkan NIM
    let profile = await prisma.memberProfile.findUnique({
      where: { nim },
      include: {
        user: true
      }
    });

    if (!profile) {
      return { success: false, message: "Data tidak ditemukan. Pastikan NIM dan Email sudah benar." };
    }

    // Validasi Email
    if (profile.user.email !== email) {
      return { success: false, message: "Data tidak ditemukan. Pastikan NIM dan Email sudah benar." };
    }

    if (profile.status === "SUSPENDED") {
      const reactivatedCount = await expireElapsedSuspensions([profile.id]);
      if (reactivatedCount > 0) {
        const refreshed = await prisma.memberProfile.findUnique({
          where: { nim },
          include: { user: true },
        });
        if (refreshed) profile = refreshed;
      }
    }

    const [rawRejectionHistories, suspendedUntil] = await Promise.all([
      getRejectionHistoryForProfile(profile.id),
      profile.status === "SUSPENDED"
        ? getSuspendedUntilForProfile(profile.id)
        : Promise.resolve(null),
    ]);
    const rejectionHistories = rawRejectionHistories.map((item) => ({
      id: item.id,
      reason: item.reason,
      rejectedAt: item.rejectedAt,
    }));

    return {
      success: true,
      data: {
        name: profile.user.name,
        email: profile.user.email,
        nim: profile.nim,
        status: profile.status,
        adminNotes: profile.adminNotes,
        joinDate: profile.joinDate,
        faculty: profile.faculty,
        major: profile.major,
        photoUrl: profile.photoUrl,
        ktmImageUrl: profile.ktmImageUrl,
        userId: profile.userId,
        phoneNumber: profile.phoneNumber,
        placeOfBirth: profile.placeOfBirth,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        address: profile.address,
        batchYear: profile.batchYear,
        updatedAt: profile.updatedAt,
        suspendedUntil,
        verificationCode: computeKtaVerificationCode(profile.nim, profile.userId),
        rejectionHistories,
      }
    };

  } catch (error) {
    logger.error("checkRegistrationStatus gagal", error);
    return { success: false, message: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }
}

export async function updateMemberPhoto(nim: string, email: string, base64Image: string) {
  try {
    // Rate limit per NIM: maks 5 kali per jam agar tidak disalahgunakan untuk spam upload
    const [byNim, byIp] = await Promise.all([
      checkRateLimit(`photo_nim_${nim}`, 5, 60 * 60 * 1000),
      checkRateLimit(`photo_ip_${await getClientIp()}`, 10, 60 * 60 * 1000),
    ]);

    if (!byNim.success || !byIp.success) {
      return { success: false, message: "Terlalu banyak percobaan. Silakan coba lagi nanti." };
    }

    let profile = await prisma.memberProfile.findUnique({
      where: { nim },
      include: { user: true }
    });

    if (!profile || profile.user.email !== email) {
      return { success: false, message: "Autentikasi gagal." };
    }

    if (profile.status === "SUSPENDED") {
      const reactivatedCount = await expireElapsedSuspensions([profile.id]);
      if (reactivatedCount > 0) {
        const refreshed = await prisma.memberProfile.findUnique({
          where: { nim },
          include: { user: true },
        });
        if (refreshed) profile = refreshed;
      }
    }

    if (
      (profile.status !== "ACTIVE" && profile.status !== "APPROVED") ||
      profile.user.status !== "ACTIVE"
    ) {
      return {
        success: false,
        message: "Fitur ganti foto tidak tersedia karena akun Anda sedang dibekukan atau tidak aktif.",
      };
    }

    // Upload gambar ke object storage (Cloudinary). Validasi format & ukuran dilakukan di dalam.
    const photoUrl = await uploadImage(base64Image, "photos");

    await prisma.memberProfile.update({
      where: { nim },
      data: { photoUrl }
    });

    return { success: true, message: "Foto berhasil diperbarui" };
  } catch (error) {
    logger.error("updateMemberPhoto gagal", error);
    return { success: false, message: "Gagal menyimpan foto. Pastikan format dan ukuran gambar sesuai." };
  }
}
