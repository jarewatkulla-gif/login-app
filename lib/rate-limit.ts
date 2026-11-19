import "server-only";

// Simple in-memory limiter: max attempts per key within a window.
const hits = new Map<string, { count: number; resetAt: number }>();

export function tooManyAttempts(key: string, max = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

export function resetAttempts(key: string) {
  hits.delete(key);
}
