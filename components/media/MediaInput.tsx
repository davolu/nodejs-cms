'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'

// A URL text input with an inline "upload" button that pushes to the media library.
export default function MediaInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function upload(files: FileList | null) {
    if (!files || !files[0]) return
    setBusy(true)
    const fd = new FormData()
    fd.append('file', files[0])
    const res = await fetch('/api/media/upload', { method: 'POST', body: fd }).catch(() => null)
    if (res && res.ok) { const m = await res.json(); onChange(m.url) }
    setBusy(false)
    if (ref.current) ref.current.value = ''
  }

  return (
    <div className="flex gap-2">
      <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'https://…'} />
      <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="btn-outline shrink-0 !px-2.5" title="Upload image">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
    </div>
  )
}
