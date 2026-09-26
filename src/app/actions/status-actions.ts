"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function checkRegistrationStatus(nim: string, email: string, turnstileToken: string) {
  try {
    // 1. Rate Limiting (Maks 10 request per 5 menit untuk cek status)
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const rateLimit = checkRateLimit(`status_${ip}`, 10, 5 * 60 * 1000);
    
    if (!rateLimit.success) {
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
    const profile = await prisma.memberProfile.findUnique({
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

    return {
      success: true,
      data: {
        name: profile.user.name,
        nim: profile.nim,
        status: profile.status,
        adminNotes: profile.adminNotes,
        joinDate: profile.joinDate,
        faculty: profile.faculty,
        major: profile.major,
        photoUrl: profile.photoUrl,
        userId: profile.userId,
      }
    };

  } catch (error) {
    console.error("Check status error:", error);
    return { success: false, message: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }
}

export async function updateMemberPhoto(nim: string, email: string, base64Image: string) {
  try {
    const profile = await prisma.memberProfile.findUnique({
      where: { nim },
      include: { user: true }
    });

    if (!profile || profile.user.email !== email) {
      return { success: false, message: "Autentikasi gagal." };
    }

    await prisma.memberProfile.update({
      where: { nim },
      data: { photoUrl: base64Image }
    });

    return { success: true, message: "Foto berhasil diperbarui" };
  } catch (error) {
    console.error("Update photo error:", error);
    return { success: false, message: "Gagal menyimpan foto" };
  }
}
