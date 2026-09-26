/* ─── Types ─── */
export interface FormData {
  namaLengkap: string;
  nim: string;
  email: string;
  noTelepon: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  fakultas: string;
  jurusan: string;
  angkatan: string;
  pasFoto: File | null;
  fotoKTM: File | null;
  persetujuan: boolean;
  turnstileToken: string;
}

export interface Errors {
  [key: string]: string;
}

export const initialFormData: FormData = {
  namaLengkap: "",
  nim: "",
  email: "",
  noTelepon: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  alamat: "",
  fakultas: "",
  jurusan: "",
  angkatan: "",
  pasFoto: null,
  fotoKTM: null,
  persetujuan: false,
  turnstileToken: "",
};

export const FAKULTAS_LIST = [
  "Fakultas Ilmu Komputer",
  "Fakultas Teknik",
  "Fakultas Kedokteran",
  "Fakultas Ekonomi dan Bisnis",
  "Fakultas Ilmu Pengetahuan Budaya",
  "Fakultas Psikologi",
  "Fakultas Hukum",
  "Fakultas Ilmu Sosial dan Ilmu Politik",
];

export const ANGKATAN_LIST = [
  "2021",
  "2022",
  "2023",
  "2024"
];

/* ─── Shared Styles ─── */
export const inputClasses = (hasError: boolean) =>
  `w-full bg-[#ffffff] border ${
    hasError ? "border-[#ba1a1a] focus:ring-[#ba1a1a] focus:border-[#ba1a1a]" : "border-[#bbcabf] focus:ring-[#006c49] focus:border-[#006c49]"
  } rounded-[8px] px-[16px] py-[8px] font-sans text-[16px] leading-[24px] text-[#191c1e] focus:ring-2 outline-none transition-shadow`;
