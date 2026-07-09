import { NextRequest, NextResponse } from 'next/server'
import { ACTION_MAP, restRequest } from '@/lib/actions'
import { connectorConnected } from '@/lib/connect'
import { resolveConnector } from '@/lib/custom-connectors'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Runs a connector action by id (admin-only). Usable for testing and programmatic use.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input = await req.json().catch(() => ({}))

  // Generic REST connector action: "rest:<connectorId>"
  if (params.id.startsWith('rest:')) {
    const c = await resolveConnector(params.id.slice(5))
    if (!c || c.auth !== 'rest') return NextResponse.json({ error: 'Unknown REST connector' }, { status: 404 })
    try { return NextResponse.json({ ok: true, result: await restRequest(c, input) }) }
    catch (e: any) { return NextResponse.json({ ok: false, error: String(e?.message || e).slice(0, 200) }, { status: 502 }) }
  }

  const action = ACTION_MAP[params.id]
  if (!action) return NextResponse.json({ error: 'Unknown action' }, { status: 404 })
  if (action.connector !== 'webhook' && !(await connectorConnected(action.connector))) {
    return NextResponse.json({ error: `${action.connector} is not connected` }, { status: 400 })
  }
  try {
    const result = await action.run(input)
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e).slice(0, 200) }, { status: 502 })
  }
}
