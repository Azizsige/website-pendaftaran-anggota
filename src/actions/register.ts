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
    console.error("Error counting quota:", error);
    return { count: 0 };
  }
}

export async function submitRegistration(formData: FormData) {
  try {
    const nim = formData.get("nim") as string;
    const email = formData.get("email") as string;
    const namaLengkap = formData.get("namaLengkap") as string;
    const fakultas = formData.get("fakultas") as string;
    const jurusan = formData.get("jurusan") as string;
    
    // 0. Cek Validasi Input (Backend Security Bypass Check)
    if (!nim || !email || !namaLengkap || !fakultas || !jurusan) {
      return { 
        success: false, 
        error: "Data pendaftaran tidak lengkap! Manipulasi form terdeteksi." 
      };
    }

    // 1. Ambil Setting Kuota & Eksekusi Transaksi yang Aman (Transaction)
    const quotaSetting = await prisma.systemSetting.findUnique({
      where: { key: "reg_max_quota" }
    });
    const maxQuota = quotaSetting && quotaSetting.value ? parseInt(quotaSetting.value) : 0;

    // 2. Cek Duplikasi dulu di luar transaksi agar cepat
    const duplicateCheck = await checkDuplicateRegistration(nim, email);
    if (duplicateCheck.isDuplicate) {
      return { success: false, error: duplicateCheck.error };
    }

    // 3. Simpan ke Database menggunakan TRANSACTION (Lapis Pengaman Terkuat)
    // Transaksi memastikan pengecekan kuota dan penyimpanan dilakukan dalam 1 paket operasi database yang tidak bisa disela.
    await prisma.$transaction(async (tx) => {
      if (maxQuota > 0) {
        const currentCount = await tx.memberProfile.count({
          where: { status: { not: "REJECTED" } }
        });

        if (currentCount >= maxQuota) {
          throw new Error("QUOTA_FULL");
        }
      }

      // Buat User (akun login)
      const user = await tx.user.create({
        data: {
          name: namaLengkap,
          email: email,
          role: "MEMBER",
          status: "ACTIVE"
        }
      });

      // Buat MemberProfile
      await tx.memberProfile.create({
        data: {
          userId: user.id,
          nim: nim,
          phoneNumber: formData.get("noTelepon") as string,
          placeOfBirth: formData.get("tempatLahir") as string,
          dateOfBirth: formData.get("tanggalLahir") ? new Date(formData.get("tanggalLahir") as string) : null,
          gender: formData.get("jenisKelamin") as string,
          address: formData.get("alamat") as string,
          faculty: formData.get("fakultas") as string,
          major: formData.get("jurusan") as string,
          batchYear: formData.get("angkatan") as string,
          status: "PENDING",
          photoUrl: "https://dummyimage.com/150x200/006c49/fff&text=Pas+Foto",
          ktmImageUrl: "https://dummyimage.com/400x250/006c49/fff&text=KTM",
        }
      });
    });

    console.log(`[${nim}] Berhasil disimpan ke database!`);
    return { success: true };

  } catch (error: any) {
    console.error("Error submitting registration:", error);
    if (error.message === "QUOTA_FULL") {
      return { 
        success: false, 
        error: "Mohon maaf, Anda kurang cepat. Sisa kuota baru saja diisi oleh pendaftar lain sedetik yang lalu." 
      };
    }
    return { success: false, error: "Terjadi kesalahan internal pada server saat menyimpan data." };
  }
}
