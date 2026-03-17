import { CreateRoomButton } from '@/components/home/CreateRoomButton'
import { JoinRoomForm } from '@/components/home/JoinRoomForm'
import { Separator } from '@/components/ui/separator'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg flex flex-col gap-10">
        {/* Hero */}
        <div className="flex flex-col gap-4">
          <h1
            className="font-display text-[clamp(4rem,14vw,8rem)] font-normal leading-[0.9] tracking-[-0.04em] text-foreground"
          >
            Trans
            <br />
            File
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
            Drop it. Share it. Done.{' '}
            <span className="text-muted-foreground/60">
              Instant P2P transfer between any devices — no uploads, no accounts.
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
              New transfer
            </p>
            <CreateRoomButton />
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground/50 tabular-nums">or</span>
            <Separator className="flex-1" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
              Join with room code
            </p>
            <JoinRoomForm />
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/40 tracking-wide">
          Files go directly between devices — never stored on any server.
        </p>
      </div>
    </main>
  )
}
