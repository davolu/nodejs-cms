import { NextRequest, NextResponse } from 'next/server'
import { collectionsRepo, entriesRepo, usersRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'
import { getMemberId, roleAtLeast } from '@/lib/members'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get('collection')
  if (!c) return NextResponse.json({ error: 'Missing collection.' }, { status: 400 })
  const col = await collectionsRepo.get(c)
  if (!col) return NextResponse.json([])

  const admin = isAuthed()
  if (col.ownership === 'own' && !admin) {
    // Per-user collection: members see only their own; managers/admins see all; anon sees none.
    const memberId = getMemberId()
    if (!memberId) return NextResponse.json([])
    const member = await usersRepo.findById(memberId)
    const seesAll = member && roleAtLeast(member.role, 'manager')
    const entries = await entriesRepo.listByCollection(col.id, true, seesAll ? undefined : memberId)
    return NextResponse.json(entries)
  }

  // Public callers only see published entries; admins see all.
  const entries = await entriesRepo.listByCollection(col.id, !admin)
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  if (!body.collectionId) return NextResponse.json({ error: 'Missing collectionId.' }, { status: 400 })
  return NextResponse.json(await entriesRepo.create(body), { status: 201 })
}
