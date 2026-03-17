'use client'

import { useCallback, useRef, useState } from 'react'
import { useSignaling } from './useSignaling'
import { useTransfer } from './useTransfer'
import type { RoomState, TransferFile } from '@/types/transfer'

interface UseRoomOptions {
  code: string
  role: 'initiator' | 'receiver'
}

interface UseRoomReturn {
  roomState: RoomState
  transfers: TransferFile[]
  sendFiles: (files: File[]) => void
  destroyPeer: () => void
}

/**
 * Combines useSignaling + useTransfer, breaking the circular dependency
 * with a stable wrapper ref that always delegates to the latest sendSignal.
 */
export function useRoom({ code, role }: UseRoomOptions): UseRoomReturn {
  const [roomState, setRoomState] = useState<RoomState>('waiting')

  // Stable wrapper so useTransfer never gets a stale sendSignal reference
  const sendSignalCallbackRef = useRef<(data: unknown) => Promise<void>>(async () => {})

  const stableSendSignal = useCallback(
    (data: unknown) => sendSignalCallbackRef.current(data),
    []
  )

  const handleConnect = useCallback(() => setRoomState('connected'), [])
  const handleDisconnect = useCallback(() => setRoomState('disconnected'), [])
  const handleRoomNotFound = useCallback(() => setRoomState('error'), [])

  const { sendFiles, transfers, signalPeer, destroyPeer } = useTransfer({
    role,
    sendSignal: stableSendSignal,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
  })

  const { sendSignal } = useSignaling({
    code,
    role,
    onSignal: signalPeer,
    onRoomNotFound: handleRoomNotFound,
  })

  // Keep the ref current so the stable wrapper always delegates to the latest function
  sendSignalCallbackRef.current = sendSignal

  return { roomState, transfers, sendFiles, destroyPeer }
}
