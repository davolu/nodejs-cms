import { NextRequest, NextResponse } from 'next/server'
import { usersRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ok = await usersRepo.remove(params.id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const role = body?.role
  if (!['member', 'manager', 'admin'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  await usersRepo.setRole(params.id, role)
  return NextResponse.json({ success: true })
}
