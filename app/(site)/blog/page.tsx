import Link from 'next/link'
import { postsRepo } from '@/lib/store'
import { fmtDate } from '@/components/ui'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Blog' }

export default async function BlogIndex() {
  const posts = (await postsRepo.list()).filter((p) => p.status === 'published')

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Blog</h1>
      <p className="mt-2 text-slate-500">Latest articles and updates.</p>

      {posts.length === 0 ? (
        <p className="mt-8 text-slate-400">No posts published yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-xl border border-slate-200 transition-shadow hover:shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.featuredImage} alt={p.title} className="h-44 w-full object-cover" />
              <div className="p-4">
                <span className="text-xs text-slate-400">{fmtDate(p.updatedAt)}</span>
                <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{p.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
