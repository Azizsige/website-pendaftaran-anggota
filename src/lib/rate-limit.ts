type RateLimitContext = {
  count: number;
  lastRequest: number;
};

const rateLimiters = new Map<string, RateLimitContext>();

/**
 * Basic in-memory rate limiter for server actions
 * @param ip IP address of the user
 * @param limit Maximum number of requests allowed
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(ip: string, limit: number, windowMs: number): { success: boolean; reset: number } {
  const now = Date.now();
  const context = rateLimiters.get(ip);

  if (!context) {
    rateLimiters.set(ip, { count: 1, lastRequest: now });
    return { success: true, reset: now + windowMs };
  }

  if (now - context.lastRequest > windowMs) {
    // Reset window
    context.count = 1;
    context.lastRequest = now;
    return { success: true, reset: now + windowMs };
  }

  if (context.count >= limit) {
    return { success: false, reset: context.lastRequest + windowMs };
  }

  context.count++;
  return { success: true, reset: context.lastRequest + windowMs };
}
