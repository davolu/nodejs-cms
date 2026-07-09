import { NextRequest, NextResponse } from 'next/server'
import { pagesRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await pagesRepo.get(params.id)
  if (!item) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const item = await pagesRepo.update(params.id, body)
    if (!item) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    return NextResponse.json(item)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await pagesRepo.remove(params.id)
  if (!ok) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
