'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizeCode, isValidCode } from '@/lib/room-code'
import { ArrowRight } from 'lucide-react'

export function JoinRoomForm() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const normalized = normalizeCode(e.target.value)
    setValue(normalized)
    if (error) setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidCode(value)) {
      setError('Enter a valid room code like WOLF-42')
      return
    }
    router.push(`/room/${value}?role=receiver`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={handleChange}
          placeholder="WOLF-42"
          className="h-12 text-base font-mono tracking-wider uppercase flex-1"
          maxLength={20}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <Button type="submit" size="lg" variant="secondary" className="h-12 px-4" aria-label="Join room">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
