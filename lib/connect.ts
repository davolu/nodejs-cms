import { connectorConfigured, isApiKey } from './connectors'
import { resolveConnector } from './custom-connectors'
import { refreshToken } from './oauth'
import { connectionsRepo } from './store'

// An app is usable when: API-key connectors have their env set; OAuth connectors
// have completed the flow (a stored connection).
export async function connectorConnected(id: string): Promise<boolean> {
  const c = await resolveConnector(id)
  if (!c) return false
  if (isApiKey(c) || c.auth === 'rest') return connectorConfigured(c)
  return !!(await connectionsRepo.get(id))
}

// Returns a valid access token for a connected app, refreshing it if expired.
// Throws if the app isn't connected or can't be refreshed.
export async function getValidToken(connectorId: string): Promise<string> {
  const c = await resolveConnector(connectorId)
  if (!c) throw new Error('Unknown connector')
  const conn = await connectionsRepo.get(connectorId)
  if (!conn) throw new Error(`${c.name} is not connected`)

  const stillValid = conn.expiresAt === 0 || conn.expiresAt - Date.now() > 60_000
  if (stillValid) return conn.accessToken

  if (!conn.refreshToken) return conn.accessToken // no refresh available; try as-is
  const t = await refreshToken(c, conn.refreshToken)
  const updated = {
    ...conn,
    accessToken: t.access_token || conn.accessToken,
    refreshToken: t.refresh_token || conn.refreshToken,
    expiresAt: t.expires_in ? Date.now() + t.expires_in * 1000 : 0,
    scope: t.scope || conn.scope,
  }
  await connectionsRepo.upsert(updated)
  return updated.accessToken
}
