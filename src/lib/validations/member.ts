import { z } from "zod";

export const memberRegistrationSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nim: z.string().min(1, "NIM wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  noTelepon: z.string().min(9, "Format no. telepon tidak valid"),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenisKelamin: z.enum(["L", "P"], { error: "Jenis kelamin wajib dipilih" }),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  fakultas: z.string().min(1, "Fakultas wajib dipilih"),
  jurusan: z.string().min(1, "Jurusan wajib diisi"),
  angkatan: z.string().min(4, "Angkatan wajib dipilih"),
  // Optional file base64
  pasFotoBase64: z.string().optional(),
  fotoKTMBase64: z.string().optional(),
  // For duplicate check
  pasFotoHash: z.string().optional(),
  fotoKTMHash: z.string().optional(),
});

export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;
