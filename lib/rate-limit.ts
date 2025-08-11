type Bucket = {
  timestamps: number[]
}

const buckets = new Map<string, Bucket>()

/**
 * Ensures a key stays within a fixed window rate limit.
 * @param key Scoped key (e.g. otp:request:STORE:IP)
 * @param maxEvents Maximum number of events in window
 * @param windowMs Window duration in ms
 */
export function ensureWithinLimit(
  key: string,
  maxEvents: number,
  windowMs: number,
): { ok: boolean; retryAfterSec?: number; remaining: number } {
  const now = Date.now()
  const bucket = buckets.get(key) || { timestamps: [] }
  // prune
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs)

  if (bucket.timestamps.length >= maxEvents) {
    const oldest = bucket.timestamps[0]
    const retryAfterMs = windowMs - (now - oldest)
    return {
      ok: false,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
      remaining: 0,
    }
  }

  bucket.timestamps.push(now)
  buckets.set(key, bucket)

  return {
    ok: true,
    remaining: Math.max(0, maxEvents - bucket.timestamps.length),
  }
}

export function windowLabel(ms: number): string {
  if (ms % (60 * 60 * 1000) === 0) return `${ms / (60 * 60 * 1000)} hours`
  if (ms % (60 * 1000) === 0) return `${ms / (60 * 1000)} minutes`
  if (ms % 1000 === 0) return `${ms / 1000} seconds`
  return `${ms} ms`
}
