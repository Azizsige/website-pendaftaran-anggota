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
  [key: string]: string | undefined;
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

export const inputClasses = (hasError: boolean) =>
  `w-full min-h-[44px] bg-[#ffffff] dark:bg-[#1a2723] border ${
    hasError
      ? "border-[#ba1a1a] focus:ring-[#ba1a1a] focus:border-[#ba1a1a] dark:border-[#f87171] dark:focus:ring-[#f87171]/40 dark:focus:border-[#f87171]"
      : "border-[#5c6b62] hover:border-[#3c4a42] focus:ring-[#006c49] focus:border-[#006c49] dark:border-[#768f84] dark:hover:border-[#a8bab0] dark:focus:ring-[#34d399]/40 dark:focus:border-[#34d399]"
  } rounded-lg px-3.5 py-2 font-sans text-[16px] sm:text-[14px] leading-[24px] sm:leading-[20px] text-[#191c1e] dark:text-[#eef2f4] placeholder:text-[#5c6b62] dark:placeholder:text-[#a8bab0] focus:ring-2 outline-none transition-colors`;
