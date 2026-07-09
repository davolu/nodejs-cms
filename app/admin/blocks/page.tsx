'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Blocks } from 'lucide-react'
import type { GlobalBlock } from '@/lib/seed'
import { PageHeader, EmptyState, fmtDate } from '@/components/ui'

export default function BlocksPage() {
  const [items, setItems] = useState<GlobalBlock[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/blocks', { cache: 'no-store' }).then((r) => r.json()).then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  async function remove(id: string) {
    if (!confirm('Delete this reusable block? Pages using it will stop showing it.')) return
    await fetch(`/api/blocks/${id}`, { method: 'DELETE' })
    setItems((x) => x.filter((b) => b.id !== id))
  }

  return (
    <div>
      <PageHeader title="Reusable blocks" subtitle="Design a section once and drop it into any page with the Global Block widget."
        action={<Link href="/admin/blocks/new" className="btn-primary shrink-0"><Plus className="h-4 w-4" /> New block</Link>} />
      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState title="No reusable blocks yet" hint="Create one, then add it to pages via the Global Block widget — edit it here and every page updates." />
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <div key={b.id} className="card flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><Blocks className="h-4 w-4" /></span>
                <div>
                  <div className="font-medium text-slate-800">{b.name}</div>
                  <div className="text-xs text-slate-400">{b.blocks.length} block{b.blocks.length === 1 ? '' : 's'} · updated {fmtDate(b.updatedAt)}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/blocks/${b.id}/edit`} className="btn-outline !py-1.5 text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                <button onClick={() => remove(b.id)} className="btn-danger !px-2 !py-1.5"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
