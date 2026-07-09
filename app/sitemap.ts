import type { MetadataRoute } from 'next'
import { pagesRepo, postsRepo } from '@/lib/store'
import { getSiteMeta, baseUrl, absUrl } from '@/lib/site-meta'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const meta = await getSiteMeta()
  const base = baseUrl(meta)
  const [pages, posts] = await Promise.all([pagesRepo.list(), postsRepo.list()])

  const entries: MetadataRoute.Sitemap = [
    { url: absUrl(base, '/'), changeFrequency: 'weekly', priority: 1 },
    { url: absUrl(base, '/blog'), changeFrequency: 'weekly', priority: 0.7 },
  ]
  for (const p of pages) {
    if (p.status !== 'published' || p.slug === 'home' || p.access === 'members') continue
    entries.push({ url: absUrl(base, `/${p.slug}`), lastModified: p.updatedAt, changeFrequency: 'monthly', priority: 0.8 })
  }
  for (const p of posts) {
    if (p.status !== 'published') continue
    entries.push({ url: absUrl(base, `/blog/${p.slug}`), lastModified: p.updatedAt, changeFrequency: 'monthly', priority: 0.6 })
  }
  return entries
}
