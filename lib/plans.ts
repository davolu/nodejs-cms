import { settingsRepo } from './store'

export interface Plan {
  id: string
  name: string
  priceCents: number
  interval: 'month' | 'year'
  description?: string
  features?: string[]
}

export async function getPlans(): Promise<Plan[]> {
  const v = await settingsRepo.get('membership_plans')
  try { const p = JSON.parse(v || '[]'); return Array.isArray(p) ? p : [] } catch { return [] }
}
export async function getPlan(id: string): Promise<Plan | null> {
  return (await getPlans()).find((p) => p.id === id) ?? null
}
