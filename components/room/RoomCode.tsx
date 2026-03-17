'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'

interface RoomCodeProps {
  code: string
}

export function RoomCode({ code }: RoomCodeProps) {
  const [copied, setCopied] = useState(false)

  // Scanning device is always the receiver
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${code}?role=receiver`
    : `/room/${code}?role=receiver`

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Code display */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-4xl font-bold tracking-widest text-foreground">
          {code}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          aria-label="Copy room code"
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
        </Button>
      </div>

      {/* QR code */}
      <Card className="p-1 bg-white">
        <CardContent className="p-2">
          <QRCodeSVG value={url} size={140} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Share the code or scan the QR with the other device
      </p>
    </div>
  )
}
