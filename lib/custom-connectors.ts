import { settingsRepo } from './store'
import { CONNECTORS, Connector } from './connectors'

// User-defined connectors (generic OAuth2 / generic REST) are stored in settings so
// people can add integrations for any provider from the UI — no code change needed.
export async function getCustomConnectors(): Promise<Connector[]> {
  const v = await settingsRepo.get('custom_connectors')
  try { const p = JSON.parse(v || '[]'); return Array.isArray(p) ? p.map((c: any) => ({ ...c, custom: true })) : [] } catch { return [] }
}
export async function saveCustomConnectors(list: Connector[]): Promise<void> {
  await settingsRepo.upsertMany([{ key: 'custom_connectors', value: JSON.stringify(list) }])
}
export async function addCustomConnector(c: Connector): Promise<Connector[]> {
  const list = await getCustomConnectors()
  const next = [...list.filter((x) => x.id !== c.id), { ...c, custom: true }]
  await saveCustomConnectors(next)
  return next
}
export async function removeCustomConnector(id: string): Promise<void> {
  const list = await getCustomConnectors()
  await saveCustomConnectors(list.filter((x) => x.id !== id))
}

// Built-in + custom connectors, merged.
export async function getAllConnectors(): Promise<Connector[]> {
  const custom = await getCustomConnectors()
  const builtinIds = new Set(CONNECTORS.map((c) => c.id))
  return [...CONNECTORS, ...custom.filter((c) => !builtinIds.has(c.id))]
}
export async function resolveConnector(id: string): Promise<Connector | undefined> {
  return (await getAllConnectors()).find((c) => c.id === id)
}
