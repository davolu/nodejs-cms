import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './globals.css'
import { getSiteMeta, baseUrl } from '@/lib/site-meta'

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSiteMeta()
  const base = baseUrl(meta)
  return {
    metadataBase: (() => { try { return new URL(base) } catch { return new URL('http://localhost:3000') } })(),
    title: { default: meta.title, template: `%s · ${meta.title}` },
    description: meta.description,
    openGraph: { siteName: meta.title, type: 'website', images: meta.ogImage ? [meta.ogImage] : [] },
    twitter: { card: 'summary_large_image', site: meta.twitter || undefined },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
