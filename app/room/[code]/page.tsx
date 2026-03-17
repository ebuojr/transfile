'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { WaitingScreen } from '@/components/room/WaitingScreen'
import { ConnectedView } from '@/components/room/ConnectedView'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'

interface RoomPageProps {
  params: Promise<{ code: string }>
  searchParams: Promise<{ role?: string }>
}

export default function RoomPage({ params, searchParams }: RoomPageProps) {
  const { code } = use(params)
  const { role: roleParam } = use(searchParams)

  const router = useRouter()

  // Room creator is initiator, joiner (navigating to /room/CODE) is receiver
  const role = roleParam === 'receiver' ? 'receiver' : 'initiator'

  const { roomState, transfers, sendFiles, destroyPeer } = useRoom({ code, role })

  function handleLeave() {
    destroyPeer()
    router.push('/')
  }

  if (roomState === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Room not found
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Room <span className="font-mono font-bold">{code}</span> doesn&apos;t exist or has expired.
            </p>
            <Button variant="secondary" onClick={() => router.push('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (roomState === 'disconnected') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Peer disconnected
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              The other device has left the session.
            </p>
            <Button onClick={() => router.push('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Start a new transfer
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            className="gap-1.5 text-muted-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Leave
          </Button>
          <span className="font-mono text-sm text-muted-foreground tracking-wider">{code}</span>
        </div>

        {/* Main card */}
        <Card>
          <CardContent className="pt-6">
            {roomState === 'waiting' && <WaitingScreen code={code} />}
            {roomState === 'connected' && (
              <ConnectedView transfers={transfers} onFiles={sendFiles} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
