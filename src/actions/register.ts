"use server";

import { prisma } from "@/lib/prisma";

export async function checkDuplicateRegistration(nim: string, email: string, ktmHash?: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { isDuplicate: true, error: "Email ini sudah terdaftar di sistem. Silakan gunakan email lain." };
    }

    const existingProfile = await prisma.memberProfile.findUnique({
      where: { nim },
    });

    if (existingProfile) {
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
    console.error("Error checking duplicate registration:", error);
    return { isDuplicate: false }; // Biarkan lolos jika terjadi error koneksi ke DB
  }
}
