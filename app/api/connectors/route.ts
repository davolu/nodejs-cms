import { NextResponse } from 'next/server'
import { connectorConfigured, isApiKey, isRest } from '@/lib/connectors'
import { getAllConnectors } from '@/lib/custom-connectors'
import { connectionsRepo } from '@/lib/store'
import { ACTIONS } from '@/lib/actions'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Status list for the admin Connectors page: configured (creds present) + connected.
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [all, conns] = await Promise.all([getAllConnectors(), connectionsRepo.list()])
  const byId = Object.fromEntries(conns.map((c) => [c.connector, c]))
  const actionsByConnector = ACTIONS.reduce((acc, a) => { (acc[a.connector] ||= []).push({ id: a.id, label: a.label, sample: a.sample }); return acc }, {} as Record<string, any[]>)

  const items = all.map((c) => {
    const apikey = isApiKey(c)
    const rest = isRest(c)
    const configured = connectorConfigured(c)
    const actions = rest ? [{ id: `rest:${c.id}`, label: 'REST request', sample: { method: 'GET', path: '/' } }] : (actionsByConnector[c.id] || [])
    return {
      id: c.id, name: c.name, category: c.category, brand: c.brand, description: c.description,
      auth: c.auth || 'oauth2', apikey, rest, custom: !!c.custom,
      configured,
      connected: (apikey || rest) ? configured : !!byId[c.id],
      account: byId[c.id]?.account || null,
      clientIdEnv: c.clientIdEnv, clientSecretEnv: c.clientSecretEnv, apiKeyEnv: c.apiKeyEnv || [], setupUrl: c.setupUrl,
      actions,
    }
  })
  return NextResponse.json(items)
}
