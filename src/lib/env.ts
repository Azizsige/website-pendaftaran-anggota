import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const envSchema = z.object({
  // Database
  POSTGRES_PRISMA_URL: z.string().min(1, "POSTGRES_PRISMA_URL wajib diisi"),
  POSTGRES_URL_NON_POOLING: optionalString,

  // Auth
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET minimal 16 karakter"),
  NEXTAUTH_URL: optionalString,

  // Cloudflare Turnstile
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
  TURNSTILE_SECRET_KEY: optionalString,

  // OCR
  OCR_SPACE_API_KEY: optionalString,

  // Rate limit (Upstash Redis). Jika kosong -> fallback in-memory (hanya aman untuk 1 instance)
  UPSTASH_REDIS_REST_URL: optionalString,
  UPSTASH_REDIS_REST_TOKEN: optionalString,

  // Object storage (Cloudinary). Jika kosong -> foto disimpan sebagai data URI (tidak disarankan)
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,

  // Set "true" hanya jika app berada di belakang reverse proxy/CDN tepercaya
  TRUST_PROXY_HEADERS: optionalString,

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Validasi environment variable sekali, lalu cache.
 * Dipanggil dari `instrumentation.ts` agar app gagal cepat saat boot.
 */
export function getEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Konfigurasi environment tidak valid:\n${details}`);
  }

  cached = parsed.data;
  return cached;
}

export const isProduction = () => process.env.NODE_ENV === "production";
