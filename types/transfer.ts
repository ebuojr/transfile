export interface SignalMessage {
  from: 'initiator' | 'receiver'
  data: unknown // simple-peer signal payload (offer, answer, or ICE candidate)
}

export interface FileMetadata {
  id: string
  name: string
  size: number
  totalChunks: number
  mimeType: string
}

export interface TransferFile {
  id: string
  name: string
  size: number
  totalChunks: number
  chunksReceived: number
  progress: number
  direction: 'sending' | 'receiving'
  status: 'pending' | 'transferring' | 'complete' | 'error'
  url?: string // blob URL for completed received files
}

export type RoomState = 'waiting' | 'connected' | 'disconnected' | 'error'
