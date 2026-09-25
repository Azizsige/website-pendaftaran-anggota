"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function registerMember(data: any) {
  try {
    const { 
      email, password, name, 
      nim, phoneNumber, placeOfBirth, dateOfBirth, gender, 
      address, province, city, region 
    } = data;

    // 1. Cek apakah registrasi sedang dibuka
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "REG_IS_ACTIVE" }
    });
    
    if (setting?.value === "false") {
      return { success: false, message: "Pendaftaran saat ini sedang ditutup." };
    }

    // 2. Cek duplikasi Email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return { success: false, message: "Email sudah terdaftar." };
    }

    // 3. Cek duplikasi NIM
    const existingProfile = await prisma.memberProfile.findUnique({
      where: { nim }
    });
    if (existingProfile) {
      return { success: false, message: "NIM sudah terdaftar." };
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Simpan data secara transaksional
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "MEMBER",
          status: "ACTIVE",
        }
      });

      const newProfile = await tx.memberProfile.create({
        data: {
          userId: newUser.id,
          nim,
          phoneNumber,
          placeOfBirth,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          address,
          status: "PENDING", // Status default
        }
      });

      return { user: newUser, profile: newProfile };
    });

    return { success: true, message: "Pendaftaran berhasil. Menunggu persetujuan admin." };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, message: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }
}
