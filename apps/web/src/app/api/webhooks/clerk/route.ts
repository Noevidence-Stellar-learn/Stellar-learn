import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@stellar-learn/database'
import { pickRandomCharacter } from '@/lib/characters'
import { loggerFromHeaders } from '@/lib/correlation'

/**
 * Clerk webhook — creates the local user row (with a randomly assigned
 * character) the moment someone signs up, rather than waiting for their
 * first quest completion. Configure this URL as an endpoint in the Clerk
 * dashboard (Webhooks) subscribed to `user.created`, and set
 * CLERK_WEBHOOK_SECRET to its signing secret.
 */
export async function POST(request: Request) {
  const log = loggerFromHeaders(request.headers)
  const signingSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!signingSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 501 })
  }

  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await request.text()
  const webhook = new Webhook(signingSecret)

  let event: { type: string; data: Record<string, unknown> }
  try {
    event = webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> }
  } catch (error) {
    log.error('clerk webhook signature verification failed', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'user.created') {
    return NextResponse.json({ received: true })
  }

  const data = event.data as {
    id: string
    email_addresses?: { email_address: string }[]
    username?: string | null
    image_url?: string | null
  }

  const email = data.email_addresses?.[0]?.email_address ?? `${data.id}@noemail.local`
  const username = data.username ?? `player_${data.id.slice(-8)}`

  try {
    await prisma.user.upsert({
      where: { clerkId: data.id },
      update: {},
      create: {
        clerkId: data.id,
        email,
        username,
        avatarUrl: data.image_url ?? null,
        characterId: pickRandomCharacter(),
        lastActiveAt: new Date(),
      },
    })
    log.info('user created with assigned character', { clerkId: data.id })
  } catch (error) {
    log.error('failed to create user from clerk webhook', { clerkId: data.id }, error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
