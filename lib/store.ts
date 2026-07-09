import { hasDb, query } from './db'
import {
  Page, Post, MediaItem, Setting, Submission, User, Product, Order,
  seedPages, seedPosts, seedMedia, seedSettings, seedSubmissions, seedUsers, seedProducts,
} from './seed'

// ── In-memory fallback stores (deep-cloned so mutations don't touch the seed) ──
const mem = {
  pages: seedPages.map((x) => ({ ...x })),
  posts: seedPosts.map((x) => ({ ...x })),
  media: seedMedia.map((x) => ({ ...x })),
  settings: seedSettings.map((x) => ({ ...x })),
  submissions: seedSubmissions.map((x) => ({ ...x })),
  users: seedUsers.map((x) => ({ ...x })),
  products: seedProducts.map((x) => ({ ...x })),
  orders: [] as Order[],
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
  theme: r.theme || 'indigo',
  access: r.access === 'members' ? 'members' : 'public',
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
      theme: input.theme || 'indigo',
      access: input.access === 'members' ? 'members' : 'public',
      template: input.template || 'default',
      metaTitle: input.metaTitle || '',
      metaDescription: input.metaDescription || '',
      status: (input.status as Page['status']) || 'draft',
      updatedAt: now(),
      createdAt: now(),
    }
    if (hasDb()) {
      await query(
        `INSERT INTO pages (id,title,slug,blocks,theme,access,template,meta_title,meta_desc,status,updated_at,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [page.id, page.title, page.slug, JSON.stringify(page.blocks), page.theme, page.access, page.template, page.metaTitle, page.metaDescription, page.status, page.updatedAt, page.createdAt]
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
        `UPDATE pages SET title=$2,slug=$3,blocks=$4,theme=$5,access=$6,template=$7,meta_title=$8,meta_desc=$9,status=$10,updated_at=$11 WHERE id=$1`,
        [id, merged.title, merged.slug, JSON.stringify(merged.blocks), merged.theme, merged.access, merged.template, merged.metaTitle, merged.metaDescription, merged.status, merged.updatedAt]
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

// ────────────────────────────  SUBMISSIONS  ────────────────────────
const toSubmission = (r: any): Submission => ({
  id: r.id, form: r.form,
  data: typeof r.data === 'string' ? JSON.parse(r.data || '{}') : (r.data || {}),
  page: r.page, createdAt: new Date(r.created_at).toISOString(),
})
export const submissionsRepo = {
  async list(): Promise<Submission[]> {
    if (hasDb()) return (await query('SELECT * FROM submissions ORDER BY created_at DESC LIMIT 500')).map(toSubmission)
    return [...mem.submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async create(input: { form?: string; data?: Record<string, string>; page?: string }): Promise<Submission> {
    const sub: Submission = {
      id: newId('sub'),
      form: (input.form || 'Form').slice(0, 120),
      data: input.data || {},
      page: input.page || '',
      createdAt: now(),
    }
    if (hasDb()) {
      await query(`INSERT INTO submissions (id,form,data,page,created_at) VALUES ($1,$2,$3,$4,$5)`,
        [sub.id, sub.form, JSON.stringify(sub.data), sub.page, sub.createdAt])
    } else {
      mem.submissions.unshift(sub)
    }
    return sub
  },
  async remove(id: string): Promise<boolean> {
    if (hasDb()) {
      const rows = await query('DELETE FROM submissions WHERE id=$1 RETURNING id', [id])
      return rows.length > 0
    }
    const i = mem.submissions.findIndex((s) => s.id === id)
    if (i === -1) return false
    mem.submissions.splice(i, 1)
    return true
  },
  async count(): Promise<number> {
    return (await this.list()).length
  },
}

// ────────────────────────────  USERS (members)  ────────────────────
const toUser = (r: any): User => ({
  id: r.id, email: r.email, name: r.name, passwordHash: r.password_hash,
  createdAt: new Date(r.created_at).toISOString(),
})
export const usersRepo = {
  async findByEmail(email: string): Promise<User | null> {
    const e = email.trim().toLowerCase()
    if (hasDb()) {
      const rows = await query('SELECT * FROM users WHERE lower(email)=$1', [e])
      return rows[0] ? toUser(rows[0]) : null
    }
    return mem.users.find((u) => u.email.toLowerCase() === e) ?? null
  },
  async findById(id: string): Promise<User | null> {
    if (hasDb()) {
      const rows = await query('SELECT * FROM users WHERE id=$1', [id])
      return rows[0] ? toUser(rows[0]) : null
    }
    return mem.users.find((u) => u.id === id) ?? null
  },
  async create(input: { email: string; name: string; passwordHash: string }): Promise<User> {
    const user: User = {
      id: newId('usr'),
      email: input.email.trim().toLowerCase(),
      name: (input.name || '').trim(),
      passwordHash: input.passwordHash,
      createdAt: now(),
    }
    if (hasDb()) {
      await query('INSERT INTO users (id,email,name,password_hash,created_at) VALUES ($1,$2,$3,$4,$5)',
        [user.id, user.email, user.name, user.passwordHash, user.createdAt])
    } else {
      mem.users.push(user)
    }
    return user
  },
  async list(): Promise<Omit<User, 'passwordHash'>[]> {
    const rows = hasDb() ? (await query('SELECT * FROM users ORDER BY created_at DESC')).map(toUser) : [...mem.users]
    return rows.map(({ passwordHash, ...u }) => u).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async remove(id: string): Promise<boolean> {
    if (hasDb()) {
      const rows = await query('DELETE FROM users WHERE id=$1 RETURNING id', [id])
      return rows.length > 0
    }
    const i = mem.users.findIndex((u) => u.id === id)
    if (i === -1) return false
    mem.users.splice(i, 1)
    return true
  },
}

// ────────────────────────────  PRODUCTS  ───────────────────────────
const toProduct = (r: any): Product => ({
  id: r.id, name: r.name, slug: r.slug, description: r.description,
  price: Number(r.price), currency: r.currency, image: r.image, active: !!r.active,
  createdAt: new Date(r.created_at).toISOString(),
})
export const productsRepo = {
  async list(onlyActive = false): Promise<Product[]> {
    let rows: Product[]
    if (hasDb()) rows = (await query('SELECT * FROM products ORDER BY created_at DESC')).map(toProduct)
    else rows = [...mem.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return onlyActive ? rows.filter((p) => p.active) : rows
  },
  async get(id: string): Promise<Product | null> {
    if (hasDb()) { const r = await query('SELECT * FROM products WHERE id=$1', [id]); return r[0] ? toProduct(r[0]) : null }
    return mem.products.find((p) => p.id === id) ?? null
  },
  async create(input: Partial<Product>): Promise<Product> {
    const p: Product = {
      id: newId('prd'), name: input.name || 'Untitled', slug: input.slug || slugify(input.name || 'product'),
      description: input.description || '', price: Math.max(0, Math.round(Number(input.price) || 0)),
      currency: input.currency || 'usd', image: input.image || '', active: input.active !== false,
      createdAt: now(),
    }
    if (hasDb()) await query('INSERT INTO products (id,name,slug,description,price,currency,image,active,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [p.id, p.name, p.slug, p.description, p.price, p.currency, p.image, p.active, p.createdAt])
    else mem.products.unshift(p)
    return p
  },
  async update(id: string, input: Partial<Product>): Promise<Product | null> {
    const existing = await this.get(id); if (!existing) return null
    const m: Product = { ...existing, ...input, price: input.price != null ? Math.max(0, Math.round(Number(input.price))) : existing.price, id }
    if (hasDb()) await query('UPDATE products SET name=$2,slug=$3,description=$4,price=$5,currency=$6,image=$7,active=$8 WHERE id=$1',
      [id, m.name, m.slug, m.description, m.price, m.currency, m.image, m.active])
    else { const i = mem.products.findIndex((x) => x.id === id); mem.products[i] = m }
    return m
  },
  async remove(id: string): Promise<boolean> {
    if (hasDb()) return (await query('DELETE FROM products WHERE id=$1 RETURNING id', [id])).length > 0
    const i = mem.products.findIndex((p) => p.id === id); if (i === -1) return false; mem.products.splice(i, 1); return true
  },
}

// ────────────────────────────  ORDERS  ─────────────────────────────
const toOrder = (r: any): Order => ({
  id: r.id, email: r.email,
  items: typeof r.items === 'string' ? JSON.parse(r.items || '[]') : (r.items || []),
  total: Number(r.total), currency: r.currency, status: r.status, stripeSession: r.stripe_session,
  createdAt: new Date(r.created_at).toISOString(),
})
export const ordersRepo = {
  async list(): Promise<Order[]> {
    if (hasDb()) return (await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500')).map(toOrder)
    return [...mem.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async create(input: { email?: string; items: any[]; total: number; currency?: string; status?: 'pending' | 'paid'; stripeSession?: string }): Promise<Order> {
    const o: Order = {
      id: newId('ord'), email: input.email || '', items: input.items || [], total: input.total || 0,
      currency: input.currency || 'usd', status: input.status || 'pending', stripeSession: input.stripeSession || '', createdAt: now(),
    }
    if (hasDb()) await query('INSERT INTO orders (id,email,items,total,currency,status,stripe_session,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [o.id, o.email, JSON.stringify(o.items), o.total, o.currency, o.status, o.stripeSession, o.createdAt])
    else mem.orders.unshift(o)
    return o
  },
  async findBySession(session: string): Promise<Order | null> {
    if (hasDb()) { const r = await query('SELECT * FROM orders WHERE stripe_session=$1', [session]); return r[0] ? toOrder(r[0]) : null }
    return mem.orders.find((o) => o.stripeSession === session) ?? null
  },
  async markPaid(id: string): Promise<void> {
    if (hasDb()) await query('UPDATE orders SET status=$2 WHERE id=$1', [id, 'paid'])
    else { const o = mem.orders.find((x) => x.id === id); if (o) o.status = 'paid' }
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
