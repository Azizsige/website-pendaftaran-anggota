import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/** Hasil standar semua server action (mutation). */
export type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

export function ok(): { success: true };
export function ok<T extends object>(data: T): { success: true } & T;
export function ok<T extends object>(data?: T) {
  return { success: true as const, ...(data ?? {}) };
}

export function fail(error: string): { success: false; error: string } {
  return { success: false, error };
}

const GENERIC_ERROR = "Terjadi kesalahan pada server. Silakan coba lagi.";

/** Ubah error apa pun menjadi pesan yang aman untuk client. */
export function toSafeMessage(error: unknown, fallback = GENERIC_ERROR): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Data tidak valid.";
  return fallback;
}

/**
 * Bungkus server action: tangkap error, log detail di server,
 * dan kembalikan pesan generik ke client.
 */
export async function safeAction<T extends object = object>(
  label: string,
  fn: () => Promise<ActionResult<T>>,
  fallbackMessage?: string
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    if (!(error instanceof AppError) && !(error instanceof ZodError)) {
      logger.error(`Action gagal: ${label}`, error);
    }
    return fail(toSafeMessage(error, fallbackMessage));
  }
}
