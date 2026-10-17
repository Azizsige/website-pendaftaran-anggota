import { z } from "zod";

export const memberRegistrationSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nim: z.string().min(1, "NIM wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  noTelepon: z.string().min(9, "Format no. telepon tidak valid"),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenisKelamin: z.string().min(1, "Jenis kelamin wajib dipilih"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  fakultas: z.string().min(1, "Fakultas wajib dipilih"),
  jurusan: z.string().min(1, "Jurusan wajib diisi"),
  angkatan: z.string().min(1, "Angkatan wajib dipilih"),
  // Optional files
  pasFotoBase64: z.string().optional(),
  fotoKTMBase64: z.string().optional(),
  pasFotoUrl: z.string().optional(),
  fotoKTMUrl: z.string().optional(),
  // Hashes
  pasFotoHash: z.string().optional(),
  fotoKTMHash: z.string().optional(),
});

export const updateMemberSchema = z.object({
  phoneNumber: z.string().min(9, "Nomor telepon minimal 9 digit"),
  address: z.string().min(3, "Alamat wajib diisi"),
  faculty: z.string().min(1, "Fakultas wajib diisi"),
  major: z.string().min(1, "Jurusan wajib diisi"),
  batchYear: z.string().min(4, "Tahun angkatan wajib 4 digit"),
});

export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
