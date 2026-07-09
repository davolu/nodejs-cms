import { NextRequest, NextResponse } from 'next/server'
import { ACTION_MAP } from '@/lib/actions'
import { connectionsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Runs a connector action by id (admin-only). Usable for testing and programmatic use.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const action = ACTION_MAP[params.id]
  if (!action) return NextResponse.json({ error: 'Unknown action' }, { status: 404 })

  const conn = await connectionsRepo.get(action.connector)
  if (!conn) return NextResponse.json({ error: `${action.connector} is not connected` }, { status: 400 })

  const input = await req.json().catch(() => ({}))
  try {
    const result = await action.run(input)
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e).slice(0, 200) }, { status: 502 })
  }
}
