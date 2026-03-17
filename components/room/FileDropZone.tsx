'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import JSZip from 'jszip'

interface FileDropZoneProps {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

async function zipDirectory(entry: FileSystemDirectoryEntry): Promise<File> {
  const zip = new JSZip()

  async function addEntry(dirEntry: FileSystemDirectoryEntry, path: string) {
    await new Promise<void>((resolve, reject) => {
      const reader = dirEntry.createReader()
      reader.readEntries(async (entries) => {
        for (const e of entries) {
          if (e.isFile) {
            const fileEntry = e as FileSystemFileEntry
            await new Promise<void>((res, rej) => {
              fileEntry.file((f) => {
                zip.file(`${path}${f.name}`, f)
                res()
              }, rej)
            })
          } else if (e.isDirectory) {
            await addEntry(e as FileSystemDirectoryEntry, `${path}${e.name}/`)
          }
        }
        resolve()
      }, reject)
    })
  }

  await addEntry(entry, '')
  const blob = await zip.generateAsync({ type: 'blob' })
  return new File([blob], `${entry.name}.zip`, { type: 'application/zip' })
}

export function FileDropZone({ onFiles, disabled }: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processItems = useCallback(
    async (items: DataTransferItemList) => {
      const files: File[] = []
      const promises: Promise<void>[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const entry = item.webkitGetAsEntry?.()
        if (entry?.isDirectory) {
          promises.push(
            zipDirectory(entry as FileSystemDirectoryEntry).then((f) => {
              files.push(f)
            })
          )
        } else {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }

      await Promise.all(promises)
      if (files.length > 0) onFiles(files)
    },
    [onFiles]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (disabled) return
      processItems(e.dataTransfer.items)
    },
    [disabled, processItems]
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) onFiles(files)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Drop files or click to select"
      onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors select-none',
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-accent/30',
        disabled && 'opacity-40 pointer-events-none'
      )}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">Drop files or folders here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to select</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={handleInputChange}
        tabIndex={-1}
      />
    </div>
  )
}
