'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import type { Post } from '@/lib/seed'
import { PageHeader, StatusBadge, EmptyState, fmtDate } from '@/components/ui'

export default function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/posts', { cache: 'no-store' })
    setPosts(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function remove(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts((p) => p.filter((x) => x.id !== id))
  }

  return (
    <div>
      <PageHeader title="Posts" subtitle="Blog posts and articles." action={{ label: 'New post', href: '/posts/new' }} />

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading posts…</div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          hint="Write your first blog post to get started."
          action={<Link href="/posts/new" className="btn-primary"><Plus className="h-4 w-4" /> New post</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              <Link href={`/posts/${p.id}/edit`} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.featuredImage} alt={p.title} className="h-36 w-full object-cover" />
              </Link>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-slate-400">{fmtDate(p.updatedAt)}</span>
                </div>
                <Link href={`/posts/${p.id}/edit`} className="block font-medium text-slate-800 hover:text-brand-700">
                  {p.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.excerpt}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="font-mono text-xs text-slate-400">/{p.slug}</span>
                  <button onClick={() => remove(p.id)} className="btn-danger !px-2 !py-1" aria-label="Delete post">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
