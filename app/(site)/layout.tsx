import Link from 'next/link'
import { settingsRepo, pagesRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, pages] = await Promise.all([settingsRepo.list(), pagesRepo.list()])
  const siteTitle = settings.find((s) => s.key === 'site_title')?.value || 'My Site'
  const nav = pages.filter((p) => p.status === 'published' && p.slug !== 'home').slice(0, 5)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">{siteTitle}</Link>
          <nav className="flex items-center gap-1 text-sm">
            {nav.map((p) => (
              <Link key={p.id} href={`/${p.slug}`} className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                {p.title}
              </Link>
            ))}
            <Link href="/blog" className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">Blog</Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-400 sm:px-6">
          © {new Date().getFullYear()} {siteTitle}. Built with ContentHub.
        </div>
      </footer>
    </div>
  )
}
