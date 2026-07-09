import { NextResponse } from 'next/server'
import { CONNECTORS, connectorConfigured } from '@/lib/connectors'
import { connectionsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Status list for the admin Connectors page: configured (creds present) + connected.
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const conns = await connectionsRepo.list()
  const byId = Object.fromEntries(conns.map((c) => [c.connector, c]))
  const items = CONNECTORS.map((c) => ({
    id: c.id, name: c.name, category: c.category, brand: c.brand, description: c.description,
    configured: connectorConfigured(c),
    connected: !!byId[c.id],
    account: byId[c.id]?.account || null,
    clientIdEnv: c.clientIdEnv, clientSecretEnv: c.clientSecretEnv, setupUrl: c.setupUrl,
  }))
  return NextResponse.json(items)
}
