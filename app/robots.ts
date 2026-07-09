import type { MetadataRoute } from 'next'
import { getSiteMeta, baseUrl, absUrl } from '@/lib/site-meta'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const meta = await getSiteMeta()
  const base = baseUrl(meta)
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: absUrl(base, '/sitemap.xml'),
  }
}
