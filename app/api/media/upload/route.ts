import { NextRequest, NextResponse } from 'next/server'
import { mediaRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'
import { uploadFile, storageProvider } from '@/lib/storage'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const MAX_BYTES = 4 * 1024 * 1024         // Vercel serverless request body cap (~4.5MB)
const MAX_INLINE_BYTES = 2 * 1024 * 1024  // 2MB when falling back to data URLs

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }
  const f = file as File
  if (!f.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are supported.' }, { status: 400 })
  }
  const provider = storageProvider()
  const limit = provider === 'inline' ? MAX_INLINE_BYTES : MAX_BYTES
  if (f.size > limit) {
    return NextResponse.json({ error: `File too large (max ${Math.round(limit / 1024 / 1024)}MB${provider === 'inline' ? ' — configure Cloudinary or disk storage for larger files' : ''}).` }, { status: 413 })
  }

  const buffer = Buffer.from(await f.arrayBuffer())
  try {
    const { url } = await uploadFile(buffer, f.name, f.type)
    const item = await mediaRepo.create({ filename: f.name, url, mimeType: f.type, sizeKb: Math.round(f.size / 1024), alt: '' })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed.' }, { status: 500 })
  }
}
