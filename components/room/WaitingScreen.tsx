import { RoomCode } from './RoomCode'
import { Loader2 } from 'lucide-react'

interface WaitingScreenProps {
  code: string
}

export function WaitingScreen({ code }: WaitingScreenProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <RoomCode code={code} />
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Waiting for peer to join…</span>
      </div>
    </div>
  )
}
