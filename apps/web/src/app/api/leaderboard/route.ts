import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { loggerFromHeaders } from '@/lib/correlation'

const redis = Redis.fromEnv()

const LEADERBOARD_KEY = 'leaderboard:global'

export async function GET(request: Request) {
  const log = loggerFromHeaders(request.headers)
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)

  try {
    // Fetch top N from Redis sorted set (score = XP, higher = better)
    const entries = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, {
      rev: true,
      withScores: true,
    })

    log.info('leaderboard fetched', { limit, count: entries.length })
    return NextResponse.json({ leaderboard: entries })
  } catch (error) {
    log.error('leaderboard fetch failed', error)
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const log = loggerFromHeaders(request.headers)

  try {
    const body = (await request.json()) as { userId: string; username: string; xp: number }
    const { userId, username, xp } = body

    await redis.zadd(LEADERBOARD_KEY, { score: xp, member: `${userId}:${username}` })

    log.info('leaderboard updated', { userId, xp })
    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('leaderboard update failed', error)
    return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 })
  }
}
