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
