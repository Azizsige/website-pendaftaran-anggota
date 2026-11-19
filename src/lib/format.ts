import { format, isValid } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type DateInput = Date | string | number | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : null;
}

/** Tanggal panjang bahasa Indonesia, mis. "7 Oktober 2026". */
export function formatDate(value: DateInput, pattern = "d MMMM yyyy", fallback = "-"): string {
  const date = toDate(value);
  return date ? format(date, pattern, { locale: idLocale }) : fallback;
}

export function formatDateTime(value: DateInput, fallback = "-"): string {
  return formatDate(value, "d MMM yyyy, HH:mm", fallback);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Menormalkan nomor telepon/WA Indonesia ke digit lokal diawali "0" (mis. "081234567890"). */
export function normalizeIndonesianPhone(value: string | null | undefined): string {
  if (!value) return "";
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) {
    digits = `0${digits.slice(2)}`;
  } else if (!digits.startsWith("0")) {
    digits = `0${digits}`;
  }
  return digits.replace(/^0+/, "0");
}

/** Format input teks telepon lokal Indonesia (mis. "0812-3456-7890") agar rapi saat diketik. */
export function formatIndonesianPhoneInput(
  value: string,
  options?: { ensureLeadingZero?: boolean }
): string {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("62")) {
    digits = `0${digits.slice(2)}`;
  } else if (options?.ensureLeadingZero && !digits.startsWith("0")) {
    digits = `0${digits}`;
  }
  digits = digits.replace(/^0+/, "0").slice(0, 14);

  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
}
