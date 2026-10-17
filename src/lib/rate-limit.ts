import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

export type RateLimitResult = { success: boolean; reset: number };

type Entry = { count: number; windowStart: number };

const memoryStore = new Map<string, Entry>();
const MAX_MEMORY_ENTRIES = 5_000;

function memoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (memoryStore.size > MAX_MEMORY_ENTRIES) {
    for (const [k, v] of memoryStore) {
      if (now - v.windowStart > windowMs) memoryStore.delete(k);
    }
  }

  const entry = memoryStore.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    memoryStore.set(key, { count: 1, windowStart: now });
    return { success: true, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, reset: entry.windowStart + windowMs };
  }

  entry.count += 1;
  return { success: true, reset: entry.windowStart + windowMs };
}

let redis: Redis | null | undefined;
const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;

  if (!redis && process.env.NODE_ENV === "production") {
    logger.warn(
      "UPSTASH_REDIS_REST_URL/TOKEN belum diatur: rate limit memakai memori lokal dan TIDAK efektif di serverless/multi-instance."
    );
  }
  return redis;
}

function getLimiter(client: Redis, limit: number, windowMs: number): Ratelimit {
  const id = `${limit}:${windowMs}`;
  let limiter = limiters.get(id);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
      prefix: "rl",
    });
    limiters.set(id, limiter);
  }
  return limiter;
}

/**
 * Rate limiter terdistribusi (Upstash Redis). Fallback in-memory bila Redis belum dikonfigurasi
 * atau sedang error, supaya fitur tetap berjalan di development.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) return memoryLimit(key, limit, windowMs);

  try {
    const result = await getLimiter(client, limit, windowMs).limit(key);
    return { success: result.success, reset: result.reset };
  } catch (error) {
    logger.error("Rate limit Redis gagal, fallback ke memori lokal", error);
    return memoryLimit(key, limit, windowMs);
  }
}
