import { FileDropZone } from './FileDropZone'
import { FileList } from './FileList'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wifi } from 'lucide-react'
import type { TransferFile } from '@/types/transfer'

interface ConnectedViewProps {
  transfers: TransferFile[]
  onFiles: (files: File[]) => void
}

export function ConnectedView({ transfers, onFiles }: ConnectedViewProps) {
  const hasTransfers = transfers.length > 0

  return (
    <div className="flex flex-col gap-5">
      {/* Status banner */}
      <div className="flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <Badge variant="secondary" className="gap-1.5 text-xs">
          <Wifi className="h-3 w-3" />
          Peer connected — transfers stay on your network
        </Badge>
      </div>

      {/* Drop zone */}
      <FileDropZone onFiles={onFiles} />

      {/* Transfer list */}
      {hasTransfers && (
        <>
          <Separator />
          <FileList transfers={transfers} />
        </>
      )}
    </div>
  )
}
