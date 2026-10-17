import { z } from "zod";

export const step1RegistrationSchema = z.object({
  namaLengkap: z.string().trim().min(1, "Nama lengkap wajib diisi"),
  nim: z.string().trim().min(1, "NIM wajib diisi"),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  noTelepon: z
    .string()
    .trim()
    .min(1, "No. telepon wajib diisi")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 9,
      "Format no. telepon tidak valid"
    ),
  tempatLahir: z.string().trim().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenisKelamin: z.string().min(1, "Jenis kelamin wajib dipilih"),
  alamat: z.string().trim().min(1, "Alamat wajib diisi"),
  fakultas: z.string().min(1, "Fakultas wajib dipilih"),
  jurusan: z.string().trim().min(1, "Jurusan wajib diisi"),
  angkatan: z.string().min(1, "Angkatan wajib dipilih"),
});

export type Step1RegistrationInput = z.infer<typeof step1RegistrationSchema>;

export function validateStep1Form(data: Record<string, unknown>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const result = step1RegistrationSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { isValid: false, errors };
}
