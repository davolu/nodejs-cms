'use client'

import { useEffect, useState } from 'react'
import { Trash2, Inbox, Mail } from 'lucide-react'
import { PageHeader, EmptyState, fmtDate } from '@/components/ui'

interface Submission { id: string; form: string; data: Record<string, string>; page: string; createdAt: string }

export default function SubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/submissions', { cache: 'no-store' })
    setItems(res.ok ? await res.json() : [])
    setSelected(new Set())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allSelected = items.length > 0 && selected.size === items.length

  async function remove(id: string) {
    if (!confirm('Delete this submission?')) return
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' })
    setItems((x) => x.filter((s) => s.id !== id))
    setSelected((s) => { const n = new Set(s); n.delete(id); return n })
  }

  async function bulkDelete() {
    const ids = [...selected]
    if (!ids.length || !confirm(`Delete ${ids.length} submission${ids.length === 1 ? '' : 's'}?`)) return
    setDeleting(true)
    await Promise.all(ids.map((id) => fetch(`/api/submissions/${id}`, { method: 'DELETE' })))
    setItems((x) => x.filter((s) => !selected.has(s.id))); setSelected(new Set()); setDeleting(false)
  }

  return (
    <div>
      <PageHeader title="Form submissions" subtitle="Messages and signups captured from your form widgets." />

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading submissions…</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          hint="Add a Contact Form or Newsletter widget to a page. Entries will appear here as visitors submit them."
        />
      ) : (
        <div className="space-y-3">
          {selected.size > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-sm">
              <label className="flex items-center gap-2 font-medium text-brand-700">
                <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(items.map((s) => s.id)))} /> {selected.size} selected
              </label>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(new Set())} className="text-slate-500 hover:text-slate-700">Clear</button>
                <button onClick={bulkDelete} disabled={deleting} className="btn-danger !py-1.5"><Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete selected'}</button>
              </div>
            </div>
          )}
          {items.map((s) => (
            <div key={s.id} className={`card p-5 ${selected.has(s.id) ? 'ring-1 ring-brand-300' : ''}`}>
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} aria-label="Select submission" className="cursor-pointer" />
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><Mail className="h-4 w-4" /></span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{s.form}</div>
                    <div className="text-xs text-slate-400">{fmtDate(s.createdAt)}{s.page && <> · from {s.page}</>}</div>
                  </div>
                </div>
                <button onClick={() => remove(s.id)} className="btn-danger !px-2" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
              <dl className="grid gap-x-6 gap-y-1.5 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-[140px_1fr]">
                {Object.entries(s.data).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-medium text-slate-500">{k}</dt>
                    <dd className="whitespace-pre-wrap break-words text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
