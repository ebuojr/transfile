'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { chunkFile, parseChunk, totalChunks as calcTotalChunks } from '@/lib/transfer'
import type { TransferFile } from '@/types/transfer'

interface UseTransferOptions {
  role: 'initiator' | 'receiver'
  sendSignal: (data: unknown) => Promise<void>
  onConnect?: () => void
  onDisconnect?: () => void
}

// Minimal typing for simple-peer to avoid import issues in SSR
interface SimplePeerInstance {
  signal: (data: unknown) => void
  send: (data: string | ArrayBuffer | Uint8Array) => void
  on: (event: string, cb: (...args: unknown[]) => void) => void
  destroy: () => void
}

export function useTransfer({ role, sendSignal, onConnect, onDisconnect }: UseTransferOptions) {
  const [peerConnected, setPeerConnected] = useState(false)
  const [transfers, setTransfers] = useState<TransferFile[]>([])

  const peerRef = useRef<SimplePeerInstance | null>(null)
  const sendSignalRef = useRef(sendSignal)
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)
  sendSignalRef.current = sendSignal
  onConnectRef.current = onConnect
  onDisconnectRef.current = onDisconnect

  const sendQueueRef = useRef<File[]>([])
  const sendingRef = useRef(false)

  // Active receive state: current file being assembled
  const receiveStateRef = useRef<{
    id: string
    name: string
    size: number
    totalChunks: number
    mimeType: string
    chunks: ArrayBuffer[]
    chunksReceived: number
  } | null>(null)

  const updateTransfer = useCallback((id: string, updates: Partial<TransferFile>) => {
    setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const processSendQueue = useCallback(async () => {
    if (!peerRef.current || sendingRef.current || sendQueueRef.current.length === 0) return
    sendingRef.current = true

    const file = sendQueueRef.current.shift()!
    const id = crypto.randomUUID()
    const fileBuffer = await file.arrayBuffer()
    const numChunks = calcTotalChunks(fileBuffer.byteLength)

    setTransfers((prev) => [
      ...prev,
      {
        id,
        name: file.name,
        size: file.size,
        totalChunks: numChunks,
        chunksReceived: 0,
        progress: 0,
        direction: 'sending',
        status: 'transferring',
      },
    ])

    // Send header
    peerRef.current.send(
      JSON.stringify({ id, name: file.name, size: file.size, totalChunks: numChunks, mimeType: file.type })
    )

    // Send chunks
    let sent = 0
    for (const chunk of chunkFile(fileBuffer)) {
      peerRef.current?.send(chunk)
      sent++
      updateTransfer(id, {
        chunksReceived: sent,
        progress: Math.round((sent / numChunks) * 100),
        status: sent === numChunks ? 'complete' : 'transferring',
      })
    }

    sendingRef.current = false

    // Process next file in queue
    if (sendQueueRef.current.length > 0) {
      processSendQueue()
    }
  }, [updateTransfer])

  const processSendQueueRef = useRef(processSendQueue)
  processSendQueueRef.current = processSendQueue

  // Expose method to feed signals from the signaling hook into the peer
  const signalPeer = useCallback((data: unknown) => {
    peerRef.current?.signal(data)
  }, [])

  useEffect(() => {
    // simple-peer is browser-only; import dynamically
    let destroyed = false

    import('simple-peer').then((module) => {
      if (destroyed) return
      const SimplePeer = module.default as new (opts: {
        initiator: boolean
        trickle: boolean
      }) => SimplePeerInstance

      const peer = new SimplePeer({ initiator: role === 'initiator', trickle: true })
      peerRef.current = peer

      peer.on('signal', (data) => {
        sendSignalRef.current(data)
      })

      peer.on('connect', () => {
        setPeerConnected(true)
        onConnectRef.current?.()
      })

      peer.on('close', () => {
        setPeerConnected(false)
        peerRef.current = null
        onDisconnectRef.current?.()
      })

      peer.on('error', () => {
        setPeerConnected(false)
        peerRef.current = null
      })

      peer.on('data', (rawData) => {
        if (typeof rawData === 'string') {
          // Header message
          try {
            const header = JSON.parse(rawData) as {
              id: string
              name: string
              size: number
              totalChunks: number
              mimeType: string
            }
            receiveStateRef.current = { ...header, chunks: [], chunksReceived: 0 }
            setTransfers((prev) => [
              ...prev,
              {
                id: header.id,
                name: header.name,
                size: header.size,
                totalChunks: header.totalChunks,
                chunksReceived: 0,
                progress: 0,
                direction: 'receiving',
                status: 'transferring',
              },
            ])
          } catch {
            // ignore malformed headers
          }
          return
        }

        // Chunk message (Uint8Array in browser)
        const current = receiveStateRef.current
        if (!current) return

        const buffer =
          rawData instanceof ArrayBuffer ? rawData : (rawData as Uint8Array).buffer as ArrayBuffer
        const { index, data } = parseChunk(buffer)

        current.chunks[index] = data
        current.chunksReceived++

        const progress = Math.round((current.chunksReceived / current.totalChunks) * 100)
        const done = current.chunksReceived === current.totalChunks

        updateTransfer(current.id, {
          chunksReceived: current.chunksReceived,
          progress,
          status: done ? 'complete' : 'transferring',
        })

        if (done) {
          // Reassemble file
          const totalSize = current.chunks.reduce((acc, c) => acc + c.byteLength, 0)
          const assembled = new Uint8Array(totalSize)
          let offset = 0
          for (const chunk of current.chunks) {
            assembled.set(new Uint8Array(chunk), offset)
            offset += chunk.byteLength
          }
          const blob = new Blob([assembled], { type: current.mimeType })
          const url = URL.createObjectURL(blob)
          updateTransfer(current.id, { url, status: 'complete' })

          // Auto-download
          const a = document.createElement('a')
          a.href = url
          a.download = current.name
          a.click()

          receiveStateRef.current = null
        }
      })
    })

    return () => {
      destroyed = true
      peerRef.current?.destroy()
      peerRef.current = null
    }
  }, [role]) // Only role matters; callbacks use refs

  const sendFiles = useCallback(
    (files: File[]) => {
      sendQueueRef.current.push(...files)
      processSendQueueRef.current()
    },
    []
  )

  const destroyPeer = useCallback(() => {
    peerRef.current?.destroy()
    peerRef.current = null
    setPeerConnected(false)
  }, [])

  return { peerConnected, transfers, sendFiles, signalPeer, destroyPeer }
}
