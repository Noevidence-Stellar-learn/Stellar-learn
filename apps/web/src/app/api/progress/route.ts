import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@stellar-learn/database'

export async function GET() {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      progress: { include: { quest: true } },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ progress: user.progress, xp: user.currentXP, level: user.level })
}

export async function POST(request: Request) {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { questId: string; xpEarned: number }
  const { questId, xpEarned } = body

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Upsert progress
  await prisma.progress.upsert({
    where: { userId_questId: { userId: user.id, questId } },
    update: { status: 'COMPLETED', xpEarned, completedAt: new Date() },
    create: {
      userId: user.id,
      questId,
      status: 'COMPLETED',
      xpEarned,
      completedAt: new Date(),
    },
  })

  // Update total XP
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      currentXP: { increment: xpEarned },
      lastActiveAt: new Date(),
    },
  })

  return NextResponse.json({ success: true, totalXP: updatedUser.currentXP })
}
