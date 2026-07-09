'use client'

import { useEffect, useState } from 'react'
import { Trash2, Inbox, Mail } from 'lucide-react'
import { PageHeader, EmptyState, fmtDate } from '@/components/ui'

interface Submission { id: string; form: string; data: Record<string, string>; page: string; createdAt: string }

export default function SubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/submissions', { cache: 'no-store' })
    setItems(res.ok ? await res.json() : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function remove(id: string) {
    if (!confirm('Delete this submission?')) return
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' })
    setItems((x) => x.filter((s) => s.id !== id))
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
          {items.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
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
