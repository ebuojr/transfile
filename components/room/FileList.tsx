import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { formatBytes } from '@/lib/transfer'
import type { TransferFile } from '@/types/transfer'

interface FileListProps {
  transfers: TransferFile[]
}

export function FileList({ transfers }: FileListProps) {
  if (transfers.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {transfers.map((file) => (
        <div key={file.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {file.direction === 'sending' ? (
                <ArrowUp className="h-4 w-4 shrink-0 text-blue-500" />
              ) : (
                <ArrowDown className="h-4 w-4 shrink-0 text-green-500" />
              )}
              <span className="text-sm font-medium truncate">{file.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground font-mono">{formatBytes(file.size)}</span>
              {file.status === 'complete' ? (
                <Badge variant="secondary" className="text-xs py-0">
                  {file.direction === 'receiving' ? 'Saved' : 'Sent'}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground font-mono tabular-nums w-10 text-right">
                  {file.progress}%
                </span>
              )}
            </div>
          </div>
          {file.status !== 'complete' && (
            <Progress value={file.progress} className="h-1.5" />
          )}
        </div>
      ))}
    </div>
  )
}
