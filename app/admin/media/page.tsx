'use client'

import { useEffect, useState } from 'react'
import { Upload, Trash2, Copy, Check } from 'lucide-react'
import type { MediaItem } from '@/lib/seed'
import { PageHeader, fmtDate } from '@/components/ui'

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/media', { cache: 'no-store' })
    setItems(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const [error, setError] = useState('')

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true); setError('')
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      if (res.ok) { const created = await res.json(); setItems((x) => [created, ...x]) }
      else { const d = await res.json().catch(() => ({})); setError(d.error || 'Upload failed.') }
    }
    setUploading(false)
  }

  async function addByUrl() {
    const url = prompt('Paste an image URL:')
    if (!url) return
    const res = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, filename: url.split('/').pop() || 'image', alt: '' }) })
    if (res.ok) { const created = await res.json(); setItems((x) => [created, ...x]) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this file?')) return
    await fetch(`/api/media/${id}`, { method: 'DELETE' })
    setItems((x) => x.filter((m) => m.id !== id))
  }

  function copyUrl(url: string) {
    navigator.clipboard?.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      <PageHeader
        title="Media"
        subtitle="Images used across your pages and posts."
        action={
          <div className="flex shrink-0 gap-2">
            <button onClick={addByUrl} className="btn-outline">From URL</button>
            <label className="btn-primary cursor-pointer">
              <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload'}
              <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => uploadFiles(e.target.files)} />
            </label>
          </div>
        }
      />

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading media…</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m.id} className="card group overflow-hidden">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt} className="aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => copyUrl(m.url)} className="rounded-md bg-white/90 p-2 text-slate-700 hover:bg-white" aria-label="Copy URL">
                    {copied === m.url ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button onClick={() => remove(m.id)} className="rounded-md bg-white/90 p-2 text-red-600 hover:bg-white" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="px-3 py-2">
                <div className="truncate text-sm font-medium text-slate-800">{m.filename}</div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{m.sizeKb} KB</span>
                  <span>{fmtDate(m.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
