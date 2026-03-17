import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import type { SignalMessage } from '@/types/transfer'

export const runtime = 'nodejs'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const redis = getRedis()

  // Check room exists
  const room = await redis.get(`room:${code}`)
  if (!room) {
    return NextResponse.json({ error: 'room-not-found' }, { status: 404 })
  }

  const body = (await request.json()) as SignalMessage
  const { from } = body

  // Push signal to the target role's queue
  const targetRole = from === 'initiator' ? 'receiver' : 'initiator'
  const signalKey = `room:${code}:signals:${targetRole}`

  await redis.lpush(signalKey, body)
  await redis.expire(signalKey, 60)

  return NextResponse.json({ ok: true })
}
