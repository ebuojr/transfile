import { getRedis } from '@/lib/redis'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const url = new URL(request.url)
  const role = (url.searchParams.get('role') ?? 'initiator') as 'initiator' | 'receiver'

  const redis = getRedis()

  // Check room exists
  const room = await redis.get(`room:${code}`)
  if (!room) {
    const body = 'data: {"type":"room-not-found"}\n\n'
    return new Response(body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false

      request.signal.addEventListener('abort', () => {
        closed = true
      })

      // Keep-alive ping every 15s
      const pingTimer = setInterval(() => {
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'))
          } catch {
            closed = true
          }
        }
      }, 15000)

      // Poll Redis for signals
      const signalKey = `room:${code}:signals:${role}`
      while (!closed) {
        try {
          // Pipeline LRANGE + DEL in one round trip to minimise the race
          // window where a concurrent push could otherwise be silently lost.
          const pipe = redis.pipeline()
          pipe.lrange(signalKey, 0, -1)
          pipe.del(signalKey)
          const results = await pipe.exec() as [unknown[], number]
          const messages = results[0] ?? []
          if (messages.length > 0) {
            // LPUSH adds to the head so reverse to deliver in original send order
            for (const msg of [...messages].reverse()) {
              if (!closed) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(msg)}\n\n`)
                )
              }
            }
          }
          await new Promise<void>((resolve) => setTimeout(resolve, 500))
        } catch {
          break
        }
      }

      clearInterval(pingTimer)
      try {
        controller.close()
      } catch {
        // already closed
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
