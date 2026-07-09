import { settingsRepo } from './store'

export interface SiteMeta {
  url: string
  title: string
  description: string
  ogImage: string
  twitter: string
  headScripts: string
  bodyScripts: string
}

export async function getSiteMeta(): Promise<SiteMeta> {
  const s = await settingsRepo.list()
  const g = (k: string) => s.find((x) => x.key === k)?.value || ''
  const url = (g('site_url') || process.env.SITE_URL || '').replace(/\/+$/, '')
  return {
    url,
    title: g('site_title') || 'My Site',
    description: g('site_description') || '',
    ogImage: g('og_image'),
    twitter: g('twitter_handle'),
    headScripts: g('head_scripts'),
    bodyScripts: g('body_scripts'),
  }
}

export function baseUrl(meta: { url: string }): string {
  return meta.url || process.env.SITE_URL || 'http://localhost:3000'
}
export function absUrl(base: string, path: string): string {
  const b = (base || '').replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return b ? `${b}${p}` : p
}
