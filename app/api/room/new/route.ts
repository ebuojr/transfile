import { NextResponse } from 'next/server'
import { generateCode } from '@/lib/room-code'
import { getRedis } from '@/lib/redis'

export const runtime = 'nodejs'

export async function GET() {
  const code = generateCode()
  const redis = getRedis()

  // Store room with 10-minute TTL
  await redis.set(`room:${code}`, { created: Date.now() }, { ex: 600 })

  return NextResponse.json({ code })
}
