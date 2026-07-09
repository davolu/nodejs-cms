import { Pool } from 'pg'
import { seedPages, seedPosts, seedMedia, seedSettings } from './seed'
import { SCHEMA_SQL } from './schema'

// A single shared pool across hot-reloads / serverless invocations.
declare global {
  // eslint-disable-next-line no-var
  var _cmsPool: Pool | undefined
  // eslint-disable-next-line no-var
  var _cmsInit: Promise<void> | undefined
}

export function hasDb(): boolean {
  return !!process.env.DATABASE_URL
}

export function getPool(): Pool {
  if (!global._cmsPool) {
    global._cmsPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Managed Postgres providers (Neon, Vercel, Supabase) require SSL.
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
      max: 5,
    })
  }
  return global._cmsPool
}

// Ensure the schema exists and seed once if the tables are empty.
async function initOnce(): Promise<void> {
  const pool = getPool()
  await pool.query(SCHEMA_SQL)

  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM pages')
  if (rows[0].c === 0) {
    for (const p of seedPages) {
      await pool.query(
        `INSERT INTO pages (id,title,slug,blocks,template,meta_title,meta_desc,status,updated_at,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.title, p.slug, JSON.stringify(p.blocks), p.template, p.metaTitle, p.metaDescription, p.status, p.updatedAt, p.createdAt]
      )
    }
    for (const p of seedPosts) {
      await pool.query(
        `INSERT INTO posts (id,title,slug,excerpt,body,featured_image,meta_title,meta_desc,status,updated_at,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.title, p.slug, p.excerpt, p.body, p.featuredImage, p.metaTitle, p.metaDescription, p.status, p.updatedAt, p.createdAt]
      )
    }
    for (const m of seedMedia) {
      await pool.query(
        `INSERT INTO media (id,filename,url,alt,mime_type,size_kb,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [m.id, m.filename, m.url, m.alt, m.mimeType, m.sizeKb, m.createdAt]
      )
    }
    for (const s of seedSettings) {
      await pool.query(
        `INSERT INTO settings (key,value,updated_at) VALUES ($1,$2,$3) ON CONFLICT (key) DO NOTHING`,
        [s.key, s.value, s.updatedAt]
      )
    }
  }
}

export function ensureReady(): Promise<void> {
  if (!global._cmsInit) global._cmsInit = initOnce()
  return global._cmsInit
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  await ensureReady()
  const { rows } = await getPool().query(text, params)
  return rows as T[]
}
