import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const LEADERBOARD_KEY = 'leaderboard:global'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)

  // Fetch top N from Redis sorted set (score = XP, higher = better)
  const entries = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, {
    rev: true,
    withScores: true,
  })

  return NextResponse.json({ leaderboard: entries })
}

export async function POST(request: Request) {
  const body = await request.json() as { userId: string; username: string; xp: number }
  const { userId, username, xp } = body

  await redis.zadd(LEADERBOARD_KEY, { score: xp, member: `${userId}:${username}` })

  return NextResponse.json({ success: true })
}
