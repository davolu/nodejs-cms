import { NextRequest, NextResponse } from 'next/server'
import { submissionsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ok = await submissionsRepo.remove(params.id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
