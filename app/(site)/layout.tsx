import Link from 'next/link'
import { settingsRepo, pagesRepo } from '@/lib/store'
import { CartProvider } from '@/components/shop/CartProvider'
import CartButton from '@/components/shop/CartButton'

export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, pages] = await Promise.all([settingsRepo.list(), pagesRepo.list()])
  const siteTitle = settings.find((s) => s.key === 'site_title')?.value || 'My Site'
  const homeId = settings.find((s) => s.key === 'home_page_id')?.value
  const nav = pages.filter((p) => p.status === 'published' && p.id !== homeId && p.slug !== 'home').slice(0, 5)
  const initial = siteTitle.trim().charAt(0).toUpperCase() || 'M'

  return (
    <CartProvider>
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-sm font-bold text-white shadow-lg shadow-brand-600/25">
              {initial}
            </span>
            <span className="site-heading text-lg font-bold tracking-tight">{siteTitle}</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
            {nav.map((p) => (
              <Link key={p.id} href={`/${p.slug}`} className="link-underline hover:text-slate-900">{p.title}</Link>
            ))}
            <Link href="/blog" className="link-underline hover:text-slate-900">Blog</Link>
          </nav>

          <Link href="/blog" className="cta !px-5 !py-2 text-xs">Read the blog</Link>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-sm font-bold text-white">
                  {initial}
                </span>
                <span className="site-heading text-lg font-bold tracking-tight">{siteTitle}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                {settings.find((s) => s.key === 'site_description')?.value || 'Built with ContentHub CMS.'}
              </p>
            </div>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pages</span>
              {nav.map((p) => (
                <Link key={p.id} href={`/${p.slug}`} className="hover:text-slate-900">{p.title}</Link>
              ))}
              <Link href="/blog" className="hover:text-slate-900">Blog</Link>
            </nav>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-400">
            © {new Date().getFullYear()} {siteTitle}. Built with ContentHub.
          </div>
        </div>
      </footer>
      <CartButton />
    </div>
    </CartProvider>
  )
}
