import { NextRequest, NextResponse } from 'next/server'
import { productsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'
import { slugify } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === '1' && isAuthed()
  try {
    return NextResponse.json(await productsRepo.list(!all))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  return NextResponse.json(await productsRepo.create(body), { status: 201 })
}
