import { NextResponse } from 'next/server'
import { CONNECTORS, connectorConfigured, isApiKey } from '@/lib/connectors'
import { connectionsRepo } from '@/lib/store'
import { ACTIONS } from '@/lib/actions'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Status list for the admin Connectors page: configured (creds present) + connected.
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const conns = await connectionsRepo.list()
  const byId = Object.fromEntries(conns.map((c) => [c.connector, c]))
  const actionsByConnector = ACTIONS.reduce((acc, a) => { (acc[a.connector] ||= []).push({ id: a.id, label: a.label, sample: a.sample }); return acc }, {} as Record<string, any[]>)
  const items = CONNECTORS.map((c) => {
    const apikey = isApiKey(c)
    const configured = connectorConfigured(c)
    return {
      id: c.id, name: c.name, category: c.category, brand: c.brand, description: c.description,
      auth: c.auth || 'oauth2', apikey,
      configured,
      connected: apikey ? configured : !!byId[c.id],
      account: byId[c.id]?.account || null,
      clientIdEnv: c.clientIdEnv, clientSecretEnv: c.clientSecretEnv, apiKeyEnv: c.apiKeyEnv || [], setupUrl: c.setupUrl,
      actions: actionsByConnector[c.id] || [],
    }
  })
  return NextResponse.json(items)
}
