"use server";

import { prisma } from "@/lib/prisma";

export async function checkRegistrationStatus(nim: string, email: string) {
  try {
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
