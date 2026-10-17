import type { Prisma } from "@prisma/client";
import type { MemberStatus, UserStatus } from "@/lib/constants/status";
import type { Role } from "@/lib/constants/roles";

export type { MemberStatus, UserStatus, Role };

/** Member dengan user yang memiliki status akun (digunakan di tabel & data anggota) */
export type MemberWithUser = Prisma.MemberProfileGetPayload<{
  include: {
    user: {
      select: { name: true; email: true; status: true };
    };
  };
}>;

/** Member profile lengkap dengan seluruh relasi user */
export type MemberProfileWithUser = Prisma.MemberProfileGetPayload<{
  include: {
    user: true;
  };
}>;

export type Member = {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: "Active" | "Suspended";
};

export type MemberFormData = {
  nim: string;
  namaLengkap: string;
  email: string;
  noTelepon: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  fakultas: string;
  jurusan: string;
  angkatan: string;
  pasFotoUrl?: string;
  fotoKTMUrl?: string;
};
