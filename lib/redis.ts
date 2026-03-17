import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

export function getRedis(): Redis {
  if (!_redis) {
    // Vercel Marketplace Upstash integration uses KV_REST_API_* prefix;
    // fall back to UPSTASH_REDIS_REST_* for manual setups.
    const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) throw new Error('Upstash Redis env vars not set')
    _redis = new Redis({ url, token })
  }
  return _redis
}
