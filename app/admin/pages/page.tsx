'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import type { Page } from '@/lib/seed'
import { PageHeader, StatusBadge, EmptyState, fmtDate } from '@/components/ui'

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/pages', { cache: 'no-store' })
    setPages(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function remove(id: string) {
    if (!confirm('Delete this page? This cannot be undone.')) return
    await fetch(`/api/pages/${id}`, { method: 'DELETE' })
    setPages((p) => p.filter((x) => x.id !== id))
  }

  return (
    <div>
      <PageHeader title="Pages" subtitle="Static pages on your website." action={{ label: 'New page', href: '/admin/pages/new' }} />

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading pages…</div>
      ) : pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          hint="Create your first page to start building out the site."
          action={<Link href="/admin/pages/new" className="btn-primary"><Plus className="h-4 w-4" /> New page</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Slug</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/pages/${p.id}/edit`} className="font-medium text-slate-800 hover:text-brand-700">
                      {p.title}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">
                    <span className="inline-flex items-center gap-1 font-mono text-xs">
                      /{p.slug} <ExternalLink className="h-3 w-3 text-slate-300" />
                    </span>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="hidden px-5 py-3 text-slate-500 md:table-cell">{fmtDate(p.updatedAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => remove(p.id)} className="btn-danger !px-2" aria-label="Delete page">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
