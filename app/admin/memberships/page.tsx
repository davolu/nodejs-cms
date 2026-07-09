'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, CreditCard } from 'lucide-react'
import type { Setting } from '@/lib/seed'
import { PageHeader } from '@/components/ui'

interface Plan { id: string; name: string; priceCents: number; interval: string; description: string; features: string[] }
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function MembershipsPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()).then((s: Setting[]) => {
      const raw = s.find((x) => x.key === 'membership_plans')?.value
      try { const p = JSON.parse(raw || '[]'); setPlans(Array.isArray(p) ? p.map((x: any) => ({ features: [], description: '', ...x })) : []) } catch { setPlans([]) }
      setLoading(false)
    })
  }, [])

  const set = (i: number, patch: Partial<Plan>) => setPlans(plans.map((p, j) => (j === i ? { ...p, ...patch } : p)))

  async function save() {
    setSaving(true); setSaved(false)
    const clean = plans.filter((p) => p.name).map((p) => ({ ...p, id: p.id || slugify(p.name), priceCents: Math.max(0, Math.round(Number(p.priceCents) || 0)), features: (p.features || []).filter(Boolean) }))
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entries: [{ key: 'membership_plans', value: JSON.stringify(clean) }] }) })
    setPlans(clean); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader title="Memberships" subtitle="Define subscription plans. Show them with the Pricing Plans widget; gate pages with the 'Subscribers only' access level."
        action={<button onClick={save} disabled={saving || loading} className="btn-primary shrink-0"><Save className="h-4 w-4" /> {saving ? 'Saving…' : saved ? 'Saved' : 'Save plans'}</button>} />

      {loading ? <div className="card p-10 text-center text-sm text-slate-400">Loading…</div> : (
        <div className="max-w-2xl space-y-4">
          {plans.map((p, i) => (
            <div key={i} className="card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><CreditCard className="h-4 w-4" /></span>
                <button onClick={() => setPlans(plans.filter((_, j) => j !== i))} className="btn-danger !px-2 !py-1.5"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Name</label><input className="input" value={p.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Pro" /></div>
                <div><label className="label">Interval</label><select className="input" value={p.interval} onChange={(e) => set(i, { interval: e.target.value })}><option value="month">Monthly</option><option value="year">Yearly</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Price (USD)</label><input type="number" step="0.01" className="input" value={(p.priceCents / 100) || ''} onChange={(e) => set(i, { priceCents: Math.round(parseFloat(e.target.value || '0') * 100) })} placeholder="9.00" /></div>
                <div><label className="label">Description</label><input className="input" value={p.description} onChange={(e) => set(i, { description: e.target.value })} /></div>
              </div>
              <div>
                <label className="label">Features (one per line)</label>
                <textarea className="input min-h-[70px]" value={(p.features || []).join('\n')} onChange={(e) => set(i, { features: e.target.value.split('\n') })} placeholder={'All premium articles\nCommunity access'} />
              </div>
            </div>
          ))}
          <button onClick={() => setPlans([...plans, { id: '', name: '', priceCents: 900, interval: 'month', description: '', features: [] }])} className="btn-outline"><Plus className="h-4 w-4" /> Add plan</button>
        </div>
      )}
    </div>
  )
}
