import { NextResponse } from 'next/server'
import { ordersRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    return NextResponse.json(await ordersRepo.list())
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
