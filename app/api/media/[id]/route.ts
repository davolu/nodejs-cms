import { NextRequest, NextResponse } from 'next/server'
import { mediaRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await mediaRepo.remove(params.id)
  if (!ok) return NextResponse.json({ error: 'Media not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
