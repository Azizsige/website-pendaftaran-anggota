import "server-only";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const DB_CHECK_TIMEOUT_MS = 6000;
const HEALTHY_CACHE_TTL_MS = 10_000;
const PAUSED_CACHE_TTL_MS = 4_000;
const WARN_LOG_COOLDOWN_MS = 60_000;

interface DbHealthCache {
  available: boolean;
  checkedAt: number;
  lastWarnedAt: number;
  inflight: Promise<boolean> | null;
}

const globalForDbHealth = globalThis as unknown as {
  __dbHealthCache?: DbHealthCache;
};

const dbCache: DbHealthCache =
  globalForDbHealth.__dbHealthCache ?? {
    available: true,
    checkedAt: 0,
    lastWarnedAt: 0,
    inflight: null,
  };

globalForDbHealth.__dbHealthCache = dbCache;

const UNAVAILABLE_CODES = new Set([
  "P1001",
  "P1002",
  "P1003",
  "P1008",
  "P1017",
  "P2021",
  "P2024",
]);

const UNAVAILABLE_PATTERNS = [
  "can't reach database server",
  "cant reach database server",
  "project is paused",
  "tenant or user not found",
  "connection terminated",
  "connection refused",
  "econnrefused",
  "etimedout",
  "enotfound",
  "socket hang up",
  "server has closed the connection",
  "db_health_timeout",
  "error querying the database",
  "does not exist in the current database",
];

/**
 * Mengenali error konektivitas / jeda basis data atau tabel belum siap
 * agar tidak tertukar dengan error validasi maupun bug logika aplikasi.
 */
export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const errObj = error as {
    code?: unknown;
    name?: unknown;
    message?: unknown;
  };

  if (typeof errObj.code === "string" && UNAVAILABLE_CODES.has(errObj.code)) {
    return true;
  }

  if (
    errObj.name === "PrismaClientInitializationError" ||
    errObj.name === "PrismaClientRustPanicError"
  ) {
    return true;
  }

  if (typeof errObj.message === "string") {
    const normalized = errObj.message.toLowerCase();
    return UNAVAILABLE_PATTERNS.some((pattern) => normalized.includes(pattern));
  }

  return false;
}

/**
 * Memeriksa apakah koneksi basis data beserta tabel inti (`SystemSetting`) aktif.
 * Membersihkan koneksi pool yang rusak saat gagal agar probe berikutnya segar.
 */
export async function checkDatabaseAvailable(options?: {
  bypassCache?: boolean;
}): Promise<boolean> {
  const bypassCache = options?.bypassCache ?? false;
  const now = Date.now();
  const ttl = dbCache.available ? HEALTHY_CACHE_TTL_MS : PAUSED_CACHE_TTL_MS;

  if (!bypassCache && dbCache.checkedAt > 0 && now - dbCache.checkedAt < ttl) {
    return dbCache.available;
  }

  if (dbCache.inflight && !bypassCache) {
    return dbCache.inflight;
  }

  const probe = (async () => {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error("DB_HEALTH_TIMEOUT"));
        }, DB_CHECK_TIMEOUT_MS);
      });

      await Promise.race([
        prisma.$queryRaw`SELECT 1 FROM "public"."SystemSetting" LIMIT 1`,
        timeoutPromise,
      ]);

      dbCache.available = true;
      dbCache.checkedAt = Date.now();
      return true;
    } catch (error) {
      dbCache.available = false;
      dbCache.checkedAt = Date.now();

      // Putus koneksi pool lama agar percobaan ulang berikutnya membuka soket baru.
      if (typeof prisma.$disconnect === "function") {
        await prisma.$disconnect().catch(() => {});
      }

      if (Date.now() - dbCache.lastWarnedAt >= WARN_LOG_COOLDOWN_MS) {
        dbCache.lastWarnedAt = Date.now();
        logger.info("DB_HEALTH_UNAVAILABLE", {
          reason: error instanceof Error ? error.message : String(error),
        });
      }

      return false;
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      dbCache.inflight = null;
    }
  })();

  dbCache.inflight = probe;
  return probe;
}
