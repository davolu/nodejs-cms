'use client'

import { useEffect, useState } from 'react'
import { APPS } from '@/lib/widgets'
import { iconMap } from '@/components/widgets/catalog'
import type { Setting } from '@/lib/seed'
import { PageHeader } from '@/components/ui'
import { Check, Plus } from 'lucide-react'

export default function AppsPage() {
  const [installed, setInstalled] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()).then((s: Setting[]) => {
      try { const v = JSON.parse(s.find((x) => x.key === 'installed_apps')?.value || '[]'); setInstalled(Array.isArray(v) ? v : []) } catch { setInstalled([]) }
      setLoading(false)
    })
  }, [])

  async function toggle(type: string) {
    const next = installed.includes(type) ? installed.filter((t) => t !== type) : [...installed, type]
    setInstalled(next); setSaving(true)
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entries: [{ key: 'installed_apps', value: JSON.stringify(next) }] }) })
    setSaving(false)
  }

  return (
    <div>
      <PageHeader title="App Store" subtitle="Enable third-party apps. Installed apps appear under “Apps” in the visual editor." />
      {loading ? <div className="card p-10 text-center text-sm text-slate-400">Loading…</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((a) => {
            const Icon = iconMap[a.type]
            const on = installed.includes(a.type)
            return (
              <div key={a.type} className="card flex flex-col p-5">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">{Icon ? <Icon className="h-5 w-5" /> : null}</span>
                  <div className="font-semibold text-slate-800">{a.label}</div>
                </div>
                <p className="flex-1 text-sm text-slate-500">{a.appDescription}</p>
                <button onClick={() => toggle(a.type)} disabled={saving}
                  className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${on ? 'bg-emerald-50 text-emerald-700' : 'btn-primary'}`}>
                  {on ? <><Check className="h-4 w-4" /> Installed</> : <><Plus className="h-4 w-4" /> Install</>}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
