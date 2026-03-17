'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { SignalMessage } from '@/types/transfer'

interface UseSignalingOptions {
  code: string
  role: 'initiator' | 'receiver'
  onSignal: (data: unknown) => void
  onRoomNotFound: () => void
}

export function useSignaling({ code, role, onSignal, onRoomNotFound }: UseSignalingOptions) {
  // Use refs so the effect never needs to re-run when callbacks change
  const onSignalRef = useRef(onSignal)
  const onRoomNotFoundRef = useRef(onRoomNotFound)
  onSignalRef.current = onSignal
  onRoomNotFoundRef.current = onRoomNotFound

  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!code) return

    const es = new EventSource(`/api/room/${code}/events?role=${role}`)
    esRef.current = es

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { type?: string; data?: unknown }
        if (msg?.type === 'room-not-found') {
          onRoomNotFoundRef.current()
          es.close()
          return
        }
        // msg is a SignalMessage wrapper { from, data }; pass the inner data to the peer
        onSignalRef.current(msg.data ?? msg)
      } catch {
        // ignore malformed messages
      }
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [code, role])

  const sendSignal = useCallback(
    async (data: unknown) => {
      await fetch(`/api/room/${code}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: role, data } satisfies SignalMessage),
      })
    },
    [code, role]
  )

  const closeStream = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
  }, [])

  return { sendSignal, closeStream }
}
