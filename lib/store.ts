import { hasDb, query } from './db'
import {
  Page, Post, MediaItem, Setting,
  seedPages, seedPosts, seedMedia, seedSettings,
} from './seed'

// ── In-memory fallback stores (deep-cloned so mutations don't touch the seed) ──
const mem = {
  pages: seedPages.map((x) => ({ ...x })),
  posts: seedPosts.map((x) => ({ ...x })),
  media: seedMedia.map((x) => ({ ...x })),
  settings: seedSettings.map((x) => ({ ...x })),
}

const now = () => new Date().toISOString()
export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
export function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ── Row mappers (snake_case → camelCase) ──
const toPage = (r: any): Page => ({
  id: r.id, title: r.title, slug: r.slug,
  blocks: Array.isArray(r.blocks) ? r.blocks : (typeof r.blocks === 'string' ? JSON.parse(r.blocks || '[]') : []),
  template: r.template,
  metaTitle: r.meta_title, metaDescription: r.meta_desc, status: r.status,
  updatedAt: new Date(r.updated_at).toISOString(), createdAt: new Date(r.created_at).toISOString(),
})
const toPost = (r: any): Post => ({
  id: r.id, title: r.title, slug: r.slug, excerpt: r.excerpt, body: r.body,
  featuredImage: r.featured_image, metaTitle: r.meta_title, metaDescription: r.meta_desc,
  status: r.status, updatedAt: new Date(r.updated_at).toISOString(), createdAt: new Date(r.created_at).toISOString(),
})
const toMedia = (r: any): MediaItem => ({
  id: r.id, filename: r.filename, url: r.url, alt: r.alt, mimeType: r.mime_type,
  sizeKb: r.size_kb, createdAt: new Date(r.created_at).toISOString(),
})
const toSetting = (r: any): Setting => ({
  key: r.key, value: r.value, updatedAt: new Date(r.updated_at).toISOString(),
})

// ─────────────────────────────  PAGES  ─────────────────────────────
export const pagesRepo = {
  async list(): Promise<Page[]> {
    if (hasDb()) return (await query('SELECT * FROM pages ORDER BY updated_at DESC')).map(toPage)
    return [...mem.pages].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
  async get(id: string): Promise<Page | null> {
    if (hasDb()) {
      const rows = await query('SELECT * FROM pages WHERE id=$1', [id])
      return rows[0] ? toPage(rows[0]) : null
    }
    return mem.pages.find((p) => p.id === id) ?? null
  },
  async getBySlug(slug: string): Promise<Page | null> {
    if (hasDb()) {
      const rows = await query('SELECT * FROM pages WHERE slug=$1', [slug])
      return rows[0] ? toPage(rows[0]) : null
    }
    return mem.pages.find((p) => p.slug === slug) ?? null
  },
  async create(input: Partial<Page>): Promise<Page> {
    const page: Page = {
      id: newId('pg'),
      title: input.title || 'Untitled page',
      slug: input.slug || slugify(input.title || 'untitled-page'),
      blocks: Array.isArray(input.blocks) ? input.blocks : [],
      template: input.template || 'default',
      metaTitle: input.metaTitle || '',
      metaDescription: input.metaDescription || '',
      status: (input.status as Page['status']) || 'draft',
      updatedAt: now(),
      createdAt: now(),
    }
    if (hasDb()) {
      await query(
        `INSERT INTO pages (id,title,slug,blocks,template,meta_title,meta_desc,status,updated_at,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [page.id, page.title, page.slug, JSON.stringify(page.blocks), page.template, page.metaTitle, page.metaDescription, page.status, page.updatedAt, page.createdAt]
      )
    } else {
      mem.pages.unshift(page)
    }
    return page
  },
  async update(id: string, input: Partial<Page>): Promise<Page | null> {
    const existing = await this.get(id)
    if (!existing) return null
    const merged: Page = { ...existing, ...input, id, updatedAt: now() }
    if (hasDb()) {
      await query(
        `UPDATE pages SET title=$2,slug=$3,blocks=$4,template=$5,meta_title=$6,meta_desc=$7,status=$8,updated_at=$9 WHERE id=$1`,
        [id, merged.title, merged.slug, JSON.stringify(merged.blocks), merged.template, merged.metaTitle, merged.metaDescription, merged.status, merged.updatedAt]
      )
    } else {
      const i = mem.pages.findIndex((p) => p.id === id)
      mem.pages[i] = merged
    }
    return merged
  },
  async remove(id: string): Promise<boolean> {
    if (hasDb()) {
      const rows = await query('DELETE FROM pages WHERE id=$1 RETURNING id', [id])
      return rows.length > 0
    }
    const i = mem.pages.findIndex((p) => p.id === id)
    if (i === -1) return false
    mem.pages.splice(i, 1)
    return true
  },
}

// ─────────────────────────────  POSTS  ─────────────────────────────
export const postsRepo = {
  async list(): Promise<Post[]> {
    if (hasDb()) return (await query('SELECT * FROM posts ORDER BY updated_at DESC')).map(toPost)
    return [...mem.posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
  async get(id: string): Promise<Post | null> {
    if (hasDb()) {
      const rows = await query('SELECT * FROM posts WHERE id=$1', [id])
      return rows[0] ? toPost(rows[0]) : null
    }
    return mem.posts.find((p) => p.id === id) ?? null
  },
  async getBySlug(slug: string): Promise<Post | null> {
    if (hasDb()) {
      const rows = await query('SELECT * FROM posts WHERE slug=$1', [slug])
      return rows[0] ? toPost(rows[0]) : null
    }
    return mem.posts.find((p) => p.slug === slug) ?? null
  },
  async create(input: Partial<Post>): Promise<Post> {
    const post: Post = {
      id: newId('ps'),
      title: input.title || 'Untitled post',
      slug: input.slug || slugify(input.title || 'untitled-post'),
      excerpt: input.excerpt || '',
      body: input.body || '',
      featuredImage: input.featuredImage || '',
      metaTitle: input.metaTitle || '',
      metaDescription: input.metaDescription || '',
      status: (input.status as Post['status']) || 'draft',
      updatedAt: now(),
      createdAt: now(),
    }
    if (hasDb()) {
      await query(
        `INSERT INTO posts (id,title,slug,excerpt,body,featured_image,meta_title,meta_desc,status,updated_at,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [post.id, post.title, post.slug, post.excerpt, post.body, post.featuredImage, post.metaTitle, post.metaDescription, post.status, post.updatedAt, post.createdAt]
      )
    } else {
      mem.posts.unshift(post)
    }
    return post
  },
  async update(id: string, input: Partial<Post>): Promise<Post | null> {
    const existing = await this.get(id)
    if (!existing) return null
    const merged: Post = { ...existing, ...input, id, updatedAt: now() }
    if (hasDb()) {
      await query(
        `UPDATE posts SET title=$2,slug=$3,excerpt=$4,body=$5,featured_image=$6,meta_title=$7,meta_desc=$8,status=$9,updated_at=$10 WHERE id=$1`,
        [id, merged.title, merged.slug, merged.excerpt, merged.body, merged.featuredImage, merged.metaTitle, merged.metaDescription, merged.status, merged.updatedAt]
      )
    } else {
      const i = mem.posts.findIndex((p) => p.id === id)
      mem.posts[i] = merged
    }
    return merged
  },
  async remove(id: string): Promise<boolean> {
    if (hasDb()) {
      const rows = await query('DELETE FROM posts WHERE id=$1 RETURNING id', [id])
      return rows.length > 0
    }
    const i = mem.posts.findIndex((p) => p.id === id)
    if (i === -1) return false
    mem.posts.splice(i, 1)
    return true
  },
}

// ─────────────────────────────  MEDIA  ─────────────────────────────
export const mediaRepo = {
  async list(): Promise<MediaItem[]> {
    if (hasDb()) return (await query('SELECT * FROM media ORDER BY created_at DESC')).map(toMedia)
    return [...mem.media].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async create(input: Partial<MediaItem>): Promise<MediaItem> {
    const item: MediaItem = {
      id: newId('md'),
      filename: input.filename || 'untitled.jpg',
      url: input.url || `https://picsum.photos/seed/${Date.now()}/600/400`,
      alt: input.alt || '',
      mimeType: input.mimeType || 'image/jpeg',
      sizeKb: input.sizeKb ?? Math.floor(80 + Math.random() * 220),
      createdAt: now(),
    }
    if (hasDb()) {
      await query(
        `INSERT INTO media (id,filename,url,alt,mime_type,size_kb,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [item.id, item.filename, item.url, item.alt, item.mimeType, item.sizeKb, item.createdAt]
      )
    } else {
      mem.media.unshift(item)
    }
    return item
  },
  async remove(id: string): Promise<boolean> {
    if (hasDb()) {
      const rows = await query('DELETE FROM media WHERE id=$1 RETURNING id', [id])
      return rows.length > 0
    }
    const i = mem.media.findIndex((m) => m.id === id)
    if (i === -1) return false
    mem.media.splice(i, 1)
    return true
  },
}

// ────────────────────────────  SETTINGS  ───────────────────────────
export const settingsRepo = {
  async list(): Promise<Setting[]> {
    if (hasDb()) return (await query('SELECT * FROM settings ORDER BY key')).map(toSetting)
    return [...mem.settings].sort((a, b) => a.key.localeCompare(b.key))
  },
  async get(key: string): Promise<string | null> {
    const all = await this.list()
    return all.find((s) => s.key === key)?.value ?? null
  },
  async upsertMany(entries: { key: string; value: string }[]): Promise<Setting[]> {
    for (const e of entries) {
      if (hasDb()) {
        await query(
          `INSERT INTO settings (key,value,updated_at) VALUES ($1,$2,$3)
           ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=EXCLUDED.updated_at`,
          [e.key, e.value, now()]
        )
      } else {
        const i = mem.settings.findIndex((s) => s.key === e.key)
        if (i >= 0) mem.settings[i] = { key: e.key, value: e.value, updatedAt: now() }
        else mem.settings.push({ key: e.key, value: e.value, updatedAt: now() })
      }
    }
    return this.list()
  },
}

// Resolve which page should render at "/" — the configured home page, falling
// back to a page with slug 'home', then null (caller renders an index).
export async function resolveHomePage(): Promise<Page | null> {
  const homeId = await settingsRepo.get('home_page_id')
  if (homeId) {
    const byId = await pagesRepo.get(homeId)
    if (byId) return byId
  }
  return pagesRepo.getBySlug('home')
}
export async function getStats() {
  const [pages, posts, media] = await Promise.all([pagesRepo.list(), postsRepo.list(), mediaRepo.list()])
  return {
    pages: pages.length,
    posts: posts.length,
    media: media.length,
    drafts: pages.filter((p) => p.status === 'draft').length + posts.filter((p) => p.status === 'draft').length,
    published: pages.filter((p) => p.status === 'published').length + posts.filter((p) => p.status === 'published').length,
    recent: [...pages.map((p) => ({ type: 'Page', title: p.title, status: p.status, updatedAt: p.updatedAt, href: `/admin/pages/${p.id}/edit` })),
             ...posts.map((p) => ({ type: 'Post', title: p.title, status: p.status, updatedAt: p.updatedAt, href: `/admin/posts/${p.id}/edit` }))]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6),
    usingDatabase: hasDb(),
  }
}
