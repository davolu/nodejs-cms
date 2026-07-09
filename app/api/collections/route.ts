import { NextRequest, NextResponse } from 'next/server'
import { collectionsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try { return NextResponse.json(await collectionsRepo.list()) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  return NextResponse.json(await collectionsRepo.create(body), { status: 201 })
}
