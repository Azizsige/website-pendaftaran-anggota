import "server-only";
import { logger } from "@/lib/logger";

/**
 * Verifikasi token Cloudflare Turnstile.
 *
 * Fail-closed di production: jika secret key tidak ada atau Cloudflare tidak
 * bisa dihubungi, verifikasi dianggap GAGAL. Di development, verifikasi dilewati
 * bila secret belum diatur.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      logger.error("TURNSTILE_SECRET_KEY belum diatur di production");
      return false;
    }
    logger.warn("TURNSTILE_SECRET_KEY belum diatur: verifikasi dilewati (development).");
    return true;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      signal: AbortSignal.timeout(8000),
    });

    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    logger.error("Verifikasi Turnstile gagal", error);
    return false;
  }
}
