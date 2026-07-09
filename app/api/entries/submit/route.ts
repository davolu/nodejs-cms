import { NextRequest, NextResponse } from 'next/server'
import { collectionsRepo, entriesRepo } from '@/lib/store'
import { getMemberId } from '@/lib/members'

export const dynamic = 'force-dynamic'

// Front-end entry submission by a logged-in member (powers the Collection Form widget).
export async function POST(req: NextRequest) {
  const memberId = getMemberId()
  if (!memberId) return NextResponse.json({ error: 'Please sign in to submit.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const col = await collectionsRepo.get(String(body.collection || ''))
  if (!col) return NextResponse.json({ error: 'Unknown collection.' }, { status: 404 })

  // Only accept known fields; coerce to strings/bounded sizes.
  const data: Record<string, any> = {}
  for (const f of col.fields) {
    const v = body.data?.[f.key]
    if (v == null) continue
    data[f.key] = typeof v === 'boolean' ? v : String(v).slice(0, 5000)
  }
  const title = String(body.title || data.title || col.fields.map((f) => data[f.key]).find(Boolean) || 'Entry').slice(0, 200)

  const entry = await entriesRepo.create({ collectionId: col.id, owner: memberId, title, data, status: 'published' })
  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 })
}
