import crypto from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

export interface UploadResult { url: string; provider: string }

function sanitize(name: string): string {
  return (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80) || 'file'
}

// Vercel Blob — preferred on Vercel. Uses OIDC automatically (VERCEL_OIDC_TOKEN +
// BLOB_STORE_ID, injected when you connect a store) and falls back to a static
// BLOB_READ_WRITE_TOKEN if one is set.
async function uploadBlob(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const folder = process.env.BLOB_FOLDER || 'contenthub'
  const opts: any = { access: 'public', contentType, addRandomSuffix: true }
  if (process.env.BLOB_READ_WRITE_TOKEN) opts.token = process.env.BLOB_READ_WRITE_TOKEN
  const res = await put(`${folder}/${filename}`, buffer, opts)
  return res.url
}

// Signed Cloudinary upload via REST (no SDK dependency).
async function uploadCloudinary(buffer: Buffer, contentType: string): Promise<string> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!
  const key = process.env.CLOUDINARY_API_KEY!
  const secret = process.env.CLOUDINARY_API_SECRET!
  const ts = Math.floor(Date.now() / 1000)
  const folder = process.env.CLOUDINARY_FOLDER || 'contenthub'
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${ts}${secret}`).digest('hex')

  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(buffer)], { type: contentType }))
  form.append('api_key', key)
  form.append('timestamp', String(ts))
  form.append('folder', folder)
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Cloudinary upload failed')
  return data.secure_url as string
}

// Local disk (self-hosted). Writes to public/uploads so files are served at /uploads/<name>.
async function uploadDisk(buffer: Buffer, filename: string): Promise<string> {
  const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(dir, { recursive: true })
  const name = `${Date.now()}-${filename}`
  await fs.writeFile(path.join(dir, name), buffer)
  const base = process.env.UPLOAD_URL_BASE || '/uploads'
  return `${base}/${name}`
}

// True when a Blob store is connected — either via OIDC (BLOB_STORE_ID) or a
// static read-write token.
const hasBlob = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
const hasCloudinary = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)

// Picks the best available backend automatically. Order: Vercel Blob → Cloudinary → disk → inline.
export async function uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<UploadResult> {
  const safe = sanitize(filename)
  if (hasBlob()) return { url: await uploadBlob(buffer, safe, contentType), provider: 'blob' }
  if (hasCloudinary()) return { url: await uploadCloudinary(buffer, contentType), provider: 'cloudinary' }

  // Local disk works on a self-hosted server (not on Vercel's read-only fs).
  if (process.env.UPLOAD_DIR || !process.env.VERCEL) {
    try { return { url: await uploadDisk(buffer, safe), provider: 'disk' } } catch { /* fall through */ }
  }

  // Zero-config fallback: inline the image as a data URL (size-capped by the caller).
  return { url: `data:${contentType};base64,${buffer.toString('base64')}`, provider: 'inline' }
}

export function storageProvider(): string {
  if (hasBlob()) return 'blob'
  if (hasCloudinary()) return 'cloudinary'
  if (process.env.UPLOAD_DIR || !process.env.VERCEL) return 'disk'
  return 'inline'
}
