/**
 * In-memory sliding-window rate limiter for the unauthenticated parent QR
 * endpoints. Mitigates slug enumeration/brute-force since those endpoints
 * have no session/token check — see docs/Flowchart_Sistem.md's own
 * "security through obscurity" note. Per-process only: fine for a single
 * Next.js instance, resets on redeploy/restart, and does not coordinate
 * across multiple instances (would need Redis for that).
 */

const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { allowed: false, remaining: 0 };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, remaining: limit - hits.length };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
