export const CHUNK_SIZE = 256 * 1024 // 256 KB

/**
 * Split a file into ArrayBuffer chunks.
 * Each chunk is prefixed with a 4-byte little-endian chunk index.
 */
export function* chunkFile(buffer: ArrayBuffer): Generator<ArrayBuffer> {
  let index = 0
  let offset = 0
  while (offset < buffer.byteLength) {
    const chunkData = buffer.slice(offset, offset + CHUNK_SIZE)
    const packet = new ArrayBuffer(4 + chunkData.byteLength)
    const view = new DataView(packet)
    view.setUint32(0, index, true) // little-endian index
    new Uint8Array(packet, 4).set(new Uint8Array(chunkData))
    yield packet
    offset += CHUNK_SIZE
    index++
  }
}

/** Parse a received chunk packet into index + data */
export function parseChunk(packet: ArrayBuffer): { index: number; data: ArrayBuffer } {
  const view = new DataView(packet)
  const index = view.getUint32(0, true)
  const data = packet.slice(4)
  return { index, data }
}

/** Calculate total number of chunks for a given byte size */
export function totalChunks(byteSize: number): number {
  return Math.ceil(byteSize / CHUNK_SIZE)
}

/** Format bytes as human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
