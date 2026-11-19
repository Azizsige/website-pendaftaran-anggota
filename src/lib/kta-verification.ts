import "server-only";
import crypto from "crypto";

function getKtaSigningKey(): string {
  return process.env.NEXTAUTH_SECRET?.trim() || "kta-verification-signing-fallback";
}

/**
 * Menghasilkan kode verifikasi unik (format XXXX-XXXX) dari NIM dan ID pengguna
 * menggunakan HMAC agar SEC-ID pada KTA fisik tidak dapat dipalsukan dari NIM saja.
 */
export function computeKtaVerificationCode(nim: string, userId: string): string {
  const normalizedNim = nim.trim();
  const normalizedUserId = userId.trim();
  const digest = crypto
    .createHmac("sha256", getKtaSigningKey())
    .update(`kta:${normalizedNim}:${normalizedUserId}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
  return `${digest.slice(0, 4)}-${digest.slice(4, 8)}`;
}

/**
 * Memverifikasi kesesuaian SEC-ID yang dipindai dari QR KTA dengan data anggota di server.
 */
export function verifyKtaVerificationCode(
  nim: string,
  userId: string,
  providedCode: string
): boolean {
  const normalizedProvided = providedCode.trim().toUpperCase();
  if (!normalizedProvided) return false;
  const expected = computeKtaVerificationCode(nim, userId);
  const bufA = Buffer.from(normalizedProvided, "utf8");
  const bufB = Buffer.from(expected, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
