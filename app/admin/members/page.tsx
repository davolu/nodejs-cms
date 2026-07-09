'use client'

import { useEffect, useState } from 'react'
import { Trash2, UserRound } from 'lucide-react'
import { PageHeader, EmptyState, fmtDate } from '@/components/ui'

interface Member { id: string; email: string; name: string; subscribed?: boolean; plan?: string; createdAt: string }

export default function MembersPage() {
  const [items, setItems] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/members', { cache: 'no-store' })
    setItems(res.ok ? await res.json() : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function remove(id: string) {
    if (!confirm('Remove this member account?')) return
    await fetch(`/api/members/${id}`, { method: 'DELETE' })
    setItems((x) => x.filter((m) => m.id !== id))
  }

  return (
    <div>
      <PageHeader title="Members" subtitle="People who registered accounts on your site." />
      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading members…</div>
      ) : items.length === 0 ? (
        <EmptyState title="No members yet" hint="Add a Login / Signup widget to a page. Registered users appear here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-500"><UserRound className="h-4 w-4" /></span>
                      {m.name || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{m.email}</td>
                  <td className="px-5 py-3">{m.subscribed ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">{m.plan || 'Subscribed'}</span> : <span className="text-xs text-slate-400">Free</span>}</td>
                  <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">{fmtDate(m.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => remove(m.id)} className="btn-danger !px-2" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
