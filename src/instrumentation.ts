import { getEnv } from "@/lib/env";

/**
 * Dipanggil Next.js sekali saat server start.
 * Jika env wajib kurang, app langsung gagal dengan pesan jelas.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    getEnv();
  }
}
