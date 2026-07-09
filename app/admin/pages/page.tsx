'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ExternalLink, Home } from 'lucide-react'
import type { Page } from '@/lib/seed'
import { PageHeader, StatusBadge, EmptyState, fmtDate } from '@/components/ui'

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [homeId, setHomeId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [p, s] = await Promise.all([
      fetch('/api/pages', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()),
    ])
    setPages(p)
    setHomeId((s.find((x: any) => x.key === 'home_page_id')?.value) || '')
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function remove(id: string) {
    if (!confirm('Delete this page? This cannot be undone.')) return
    await fetch(`/api/pages/${id}`, { method: 'DELETE' })
    setPages((p) => p.filter((x) => x.id !== id))
  }

  async function setHome(page: Page) {
    if (page.status !== 'published') {
      alert('Publish this page before setting it as the home page.')
      return
    }
    setHomeId(page.id)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: [{ key: 'home_page_id', value: page.id }] }),
    })
  }

  return (
    <div>
      <PageHeader title="Pages" subtitle="Pages on your website." action={{ label: 'New page', href: '/admin/pages/new' }} />

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
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((p) => {
                const isHome = p.id === homeId
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/pages/${p.id}/edit`} className="inline-flex items-center gap-2 font-medium text-slate-800 hover:text-brand-700">
                        {p.title}
                        {isHome && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                            <Home className="h-3 w-3" /> Home
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">
                      <span className="inline-flex items-center gap-1 font-mono text-xs">
                        /{p.slug} <ExternalLink className="h-3 w-3 text-slate-300" />
                      </span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    <td className="hidden px-5 py-3 text-slate-500 md:table-cell">{fmtDate(p.updatedAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setHome(p)}
                          className={`btn-ghost !px-2 ${isHome ? 'text-brand-600' : 'text-slate-400'}`}
                          title={isHome ? 'This is your home page' : 'Set as home page'}
                          aria-label="Set as home page"
                        >
                          <Home className="h-4 w-4" fill={isHome ? 'currentColor' : 'none'} />
                        </button>
                        <button onClick={() => remove(p.id)} className="btn-danger !px-2" aria-label="Delete page">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
