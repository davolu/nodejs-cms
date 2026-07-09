import { NextRequest, NextResponse } from 'next/server'
import { connectionsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectionsRepo.remove(params.id)
  return NextResponse.json({ success: true })
}
