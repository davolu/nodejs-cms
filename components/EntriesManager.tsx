'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react'
import type { Collection, Entry } from '@/lib/seed'
import { PageHeader, EmptyState, StatusBadge, fmtDate } from '@/components/ui'
import MediaInput from '@/components/media/MediaInput'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function EntriesManager({ collection }: { collection: Collection }) {
  const [items, setItems] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('published')
  const [data, setData] = useState<Record<string, any>>({})

  async function load() { const r = await fetch(`/api/entries?collection=${collection.id}`, { cache: 'no-store' }); setItems(r.ok ? await r.json() : []); setLoading(false) }
  useEffect(() => { load() }, [])

  function startNew() { setEditing(null); setTitle(''); setSlug(''); setStatus('published'); setData({}); setOpen(true) }
  function startEdit(e: Entry) { setEditing(e); setTitle(e.title); setSlug(e.slug); setStatus(e.status); setData(e.data || {}); setOpen(true) }

  async function save() {
    const payload = { collectionId: collection.id, title, slug: slug || slugify(title), status, data }
    if (editing) await fetch(`/api/entries/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    else await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setOpen(false); load()
  }
  async function remove(id: string) { if (!confirm('Delete this entry?')) return; await fetch(`/api/entries/${id}`, { method: 'DELETE' }); setItems((x) => x.filter((e) => e.id !== id)) }
  const setVal = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }))

  return (
    <div>
      <Link href="/admin/collections" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Collections</Link>
      <PageHeader title={collection.name} subtitle={`Entries in the ${collection.name} collection.`}
        action={<button onClick={startNew} className="btn-primary shrink-0"><Plus className="h-4 w-4" /> New entry</button>} />

      {loading ? <div className="card p-10 text-center text-sm text-slate-400">Loading…</div>
        : items.length === 0 ? <EmptyState title="No entries yet" hint="Add your first entry to this collection." />
        : (
          <div className="space-y-2">
            {items.map((e) => (
              <div key={e.id} className="card flex items-center justify-between p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="truncate font-medium text-slate-800">{e.title}</span><StatusBadge status={e.status} /></div>
                  <div className="text-xs text-slate-400">/{e.slug} · updated {fmtDate(e.updatedAt)}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => startEdit(e)} className="btn-outline !py-1.5 text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => remove(e.id)} className="btn-danger !px-2 !py-1.5"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit entry' : 'New entry'}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Title</label><input className="input" value={title} onChange={(e) => { setTitle(e.target.value); if (!editing) setSlug(slugify(e.target.value)) }} /></div>
              {collection.fields.map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  {f.type === 'textarea' ? <textarea className="input min-h-[80px]" value={data[f.key] ?? ''} onChange={(e) => setVal(f.key, e.target.value)} />
                    : f.type === 'image' ? <MediaInput value={data[f.key] ?? ''} onChange={(v) => setVal(f.key, v)} />
                    : f.type === 'boolean' ? <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={!!data[f.key]} onChange={(e) => setVal(f.key, e.target.checked)} /> Yes</label>
                    : f.type === 'number' ? <input type="number" className="input" value={data[f.key] ?? ''} onChange={(e) => setVal(f.key, e.target.value)} />
                    : f.type === 'date' ? <input type="date" className="input" value={data[f.key] ?? ''} onChange={(e) => setVal(f.key, e.target.value)} />
                    : <input className="input" value={data[f.key] ?? ''} onChange={(e) => setVal(f.key, e.target.value)} />}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Slug</label><input className="input" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} /></div>
                <div><label className="label">Status</label><select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="published">Published</option><option value="draft">Draft</option></select></div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={save} className="btn-primary">Save entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
