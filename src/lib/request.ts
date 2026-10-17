import "server-only";
import { headers } from "next/headers";

/**
 * Ambil IP client dengan aman.
 *
 * Header seperti `x-forwarded-for` bisa dipalsukan client jika app tidak berada
 * di belakang proxy tepercaya. Karena itu header hanya dipercaya jika:
 *  - berjalan di Vercel, atau
 *  - `TRUST_PROXY_HEADERS=true` (reverse proxy/CDN tepercaya yang menimpa header).
 *
 * Jika tidak tepercaya, kembalikan "unknown". Caller sebaiknya menggabungkan
 * IP dengan identifier lain (mis. NIM/email) agar rate limit tidak bisa dihindari.
 */
export async function getClientIp(): Promise<string> {
  const trusted = process.env.VERCEL === "1" || process.env.TRUST_PROXY_HEADERS === "true";
  if (!trusted) return "unknown";

  const h = await headers();
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const real = h.get("x-real-ip");
  if (real) return real.trim();

  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
