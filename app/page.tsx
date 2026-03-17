import { CreateRoomButton } from '@/components/home/CreateRoomButton'
import { JoinRoomForm } from '@/components/home/JoinRoomForm'
import { Separator } from '@/components/ui/separator'
import { Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TransFile</h1>
            <p className="text-muted-foreground text-sm mt-1">Drop it. Share it. Done.</p>
          </div>
          <p className="text-xs text-muted-foreground/70 max-w-[260px]">
            Instant P2P file transfer between any devices on your network — no uploads, no accounts.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New transfer</p>
            <CreateRoomButton />
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or join existing</span>
            <Separator className="flex-1" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enter room code</p>
            <JoinRoomForm />
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/50">
          Files go directly between devices — never stored on any server.
        </p>
      </div>
    </main>
  )
}
