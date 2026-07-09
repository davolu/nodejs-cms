import { postsRepo } from '@/lib/store'
import { getSiteMeta, baseUrl, absUrl } from '@/lib/site-meta'

export const dynamic = 'force-dynamic'

const esc = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function GET() {
  const meta = await getSiteMeta()
  const base = baseUrl(meta)
  const posts = (await postsRepo.list()).filter((p) => p.status === 'published')

  const items = posts.map((p) => `
    <item>
      <title>${esc(p.metaTitle || p.title)}</title>
      <link>${absUrl(base, `/blog/${p.slug}`)}</link>
      <guid>${absUrl(base, `/blog/${p.slug}`)}</guid>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <description>${esc(p.metaDescription || p.excerpt)}</description>
    </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${esc(meta.title)} — Blog</title>
  <link>${absUrl(base, '/blog')}</link>
  <description>${esc(meta.description)}</description>
  <language>en</language>${items}
</channel></rss>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
