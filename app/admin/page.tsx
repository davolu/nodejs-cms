import Link from 'next/link'
import { FileText, Newspaper, Image as ImageIcon, PenLine, Database, HardDrive, Plus } from 'lucide-react'
import { getStats } from '@/lib/store'
import { StatusBadge, fmtDate } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Pages', value: stats.pages, icon: FileText, href: '/admin/pages' },
    { label: 'Posts', value: stats.posts, icon: Newspaper, href: '/admin/posts' },
    { label: 'Media', value: stats.media, icon: ImageIcon, href: '/admin/media' },
    { label: 'Drafts', value: stats.drafts, icon: PenLine, href: '/admin/pages' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of your content.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/pages/new" className="btn-outline"><Plus className="h-4 w-4" /> New page</Link>
          <Link href="/admin/posts/new" className="btn-primary"><Plus className="h-4 w-4" /> New post</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card p-4 transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {stats.recent.map((r, i) => (
              <li key={i}>
                <Link href={r.href} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{r.type}</span>
                    <span className="text-sm font-medium text-slate-800">{r.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={r.status} />
                    <span className="hidden text-xs text-slate-400 sm:inline">{fmtDate(r.updatedAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Storage</h2>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            {stats.usingDatabase ? (
              <>
                <Database className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-sm font-medium text-slate-800">PostgreSQL connected</div>
                  <div className="text-xs text-slate-500">Changes are persisted to your database.</div>
                </div>
              </>
            ) : (
              <>
                <HardDrive className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="text-sm font-medium text-slate-800">Demo mode (in-memory)</div>
                  <div className="text-xs text-slate-500">Set DATABASE_URL to persist to PostgreSQL.</div>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-slate-200 py-3">
              <div className="text-xl font-semibold text-slate-900">{stats.published}</div>
              <div className="text-xs text-slate-500">Published</div>
            </div>
            <div className="rounded-lg border border-slate-200 py-3">
              <div className="text-xl font-semibold text-slate-900">{stats.drafts}</div>
              <div className="text-xs text-slate-500">Drafts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
