'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Pencil } from 'lucide-react'
import type { Post } from '@/lib/seed'
import { PageHeader, StatusBadge, EmptyState, fmtDate } from '@/components/ui'

export default function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/posts', { cache: 'no-store' })
    setPosts(await res.json())
    setSelected(new Set())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allSelected = posts.length > 0 && selected.size === posts.length

  async function remove(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts((p) => p.filter((x) => x.id !== id))
    setSelected((s) => { const n = new Set(s); n.delete(id); return n })
  }

  async function bulkDelete() {
    const ids = [...selected]
    if (!ids.length || !confirm(`Delete ${ids.length} post${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return
    setDeleting(true)
    await Promise.all(ids.map((id) => fetch(`/api/posts/${id}`, { method: 'DELETE' })))
    setPosts((p) => p.filter((x) => !selected.has(x.id))); setSelected(new Set()); setDeleting(false)
  }

  return (
    <div>
      <PageHeader title="Posts" subtitle="Blog posts and articles." action={{ label: 'New post', href: '/admin/posts/new' }} />

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading posts…</div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          hint="Write your first blog post to get started."
          action={<Link href="/admin/posts/new" className="btn-primary"><Plus className="h-4 w-4" /> New post</Link>}
        />
      ) : (
        <>
          {selected.size > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-sm">
              <label className="flex items-center gap-2 font-medium text-brand-700">
                <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(posts.map((p) => p.id)))} /> {selected.size} selected
              </label>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(new Set())} className="text-slate-500 hover:text-slate-700">Clear</button>
                <button onClick={bulkDelete} disabled={deleting} className="btn-danger !py-1.5"><Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete selected'}</button>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <div key={p.id} className={`card relative overflow-hidden ${selected.has(p.id) ? 'ring-2 ring-brand-400' : ''}`}>
              <label className="absolute left-2 top-2 z-10 grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-white/90 shadow-sm ring-1 ring-slate-200">
                <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.title}`} className="cursor-pointer" />
              </label>
              <Link href={`/admin/posts/${p.id}/edit`} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.featuredImage} alt={p.title} className="h-36 w-full object-cover" />
              </Link>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-slate-400">{fmtDate(p.updatedAt)}</span>
                </div>
                <Link href={`/admin/posts/${p.id}/edit`} className="block font-medium text-slate-800 hover:text-brand-700">
                  {p.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.excerpt}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="font-mono text-xs text-slate-400">/{p.slug}</span>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/posts/${p.id}/edit`} className="btn-ghost !px-2 !py-1 text-slate-500 hover:text-brand-700" aria-label="Edit post" title="Edit post">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => remove(p.id)} className="btn-danger !px-2 !py-1" aria-label="Delete post">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  )
}
