import Link from 'next/link'
import { settingsRepo, pagesRepo } from '@/lib/store'
import { getSiteMeta, baseUrl } from '@/lib/site-meta'
import { CartProvider } from '@/components/shop/CartProvider'
import CartButton from '@/components/shop/CartButton'
import RawScripts from '@/components/site/RawScripts'
import JsonLd from '@/components/site/JsonLd'
import BackToTop from '@/components/site/BackToTop'
import { getBrand, brandCss, brandFontsHref } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, pages, meta, brand] = await Promise.all([settingsRepo.list(), pagesRepo.list(), getSiteMeta(), getBrand()])
  const get = (k: string) => settings.find((s) => s.key === k)?.value || ''
  const siteTitle = get('site_title') || 'My Site'
  const homeId = get('home_page_id')
  const autoNav = pages.filter((p) => p.status === 'published' && p.id !== homeId && p.slug !== 'home').slice(0, 5).map((p) => ({ label: p.title, href: `/${p.slug}` }))
  const parseLinks = (v: string) => { try { const p = JSON.parse(v); return Array.isArray(p) ? p as { label: string; href: string }[] : [] } catch { return [] } }
  const customNav = parseLinks(get('nav_menu'))
  const nav = customNav.length > 0 ? customNav : autoNav
  const footerLinks = parseLinks(get('footer_links'))
  const ctaLabel = get('header_cta_label') || 'Read the blog'
  const ctaHref = get('header_cta_href') || '/blog'
  const footerText = get('footer_text') || meta.description || 'Built with ContentHub CMS.'
  const initial = siteTitle.trim().charAt(0).toUpperCase() || 'M'
  const base = baseUrl(meta)
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: meta.title,
    description: meta.description,
    url: base,
  }

  return (
    <CartProvider>
    <JsonLd data={websiteLd} />
    {brandFontsHref(brand) && <link rel="stylesheet" href={brandFontsHref(brand)} />}
    <style>{brandCss(brand)}</style>
    <RawScripts html={meta.headScripts} target="head" />
    <div className="flex min-h-screen flex-col brand-surface" style={{ background: 'var(--brand-bg)', color: 'var(--brand-text)' }}>
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white shadow-lg" style={{ backgroundImage: 'linear-gradient(120deg, var(--brand-from), var(--brand-to))' }}>
              {initial}
            </span>
            <span className="site-heading text-lg font-bold tracking-tight">{siteTitle}</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
            {nav.map((item, i) => (
              <Link key={i} href={item.href} className="link-underline hover:text-slate-900">{item.label}</Link>
            ))}
            <Link href="/blog" className="link-underline hover:text-slate-900">Blog</Link>
          </nav>

          <Link href={ctaHref} className="cta !px-5 !py-2 text-xs">{ctaLabel}</Link>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white" style={{ backgroundImage: 'linear-gradient(120deg, var(--brand-from), var(--brand-to))' }}>
                  {initial}
                </span>
                <span className="site-heading text-lg font-bold tracking-tight">{siteTitle}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                {footerText}
              </p>
            </div>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pages</span>
              {(footerLinks.length > 0 ? footerLinks : nav).map((item, i) => (
                <Link key={i} href={item.href} className="hover:text-slate-900">{item.label}</Link>
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
      <RawScripts html={meta.bodyScripts} target="body" />
    </div>
    <BackToTop />
    </CartProvider>
  )
}
