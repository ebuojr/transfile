'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function CreateRoomButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch('/api/room/new')
      const { code } = await res.json() as { code: string }
      router.push(`/room/${code}`)
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      onClick={handleCreate}
      disabled={loading}
      className="w-full text-base h-12 gap-2"
    >
      <Plus className="h-5 w-5" />
      {loading ? 'Creating room…' : 'Create Room'}
    </Button>
  )
}
