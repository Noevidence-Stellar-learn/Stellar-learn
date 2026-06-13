import { Redis } from '@upstash/redis'

/** Upstash sorted set holding every player's XP, highest first. */
export const LEADERBOARD_KEY = 'leaderboard:global'

/** True only when real Upstash REST credentials are present. */
function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

/**
 * Push a player's running XP total into the global leaderboard ZSET.
 *
 * No-ops (and never throws) when Upstash isn't configured or the call fails —
 * the leaderboard is a regenerable projection of the XP stored in Postgres, so
 * a Redis hiccup must never break saving a player's progress.
 */
export async function updateLeaderboard(
  userId: string,
  username: string,
  totalXP: number
): Promise<void> {
  if (!redisConfigured()) return
  try {
    const redis = Redis.fromEnv()
    await redis.zadd(LEADERBOARD_KEY, { score: totalXP, member: `${userId}:${username}` })
  } catch (err) {
    console.error('[leaderboard] update failed:', err)
  }
}
