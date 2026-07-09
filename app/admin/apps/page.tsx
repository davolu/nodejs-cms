'use client'

import { useEffect, useState } from 'react'
import { APPS } from '@/lib/widgets'
import { iconMap } from '@/components/widgets/catalog'
import type { Setting } from '@/lib/seed'
import { PageHeader } from '@/components/ui'
import { Check, Plus } from 'lucide-react'

// Group embed apps into meaningful storefront categories.
const APP_CATEGORY: Record<string, string> = {
  app_youtube: 'Video', app_spotify: 'Music', app_soundcloud: 'Music',
  app_instagram: 'Social', app_twitter: 'Social', app_tiktok: 'Social',
  app_github: 'Developer', app_calcom: 'Scheduling', app_typeform: 'Forms',
  app_discord: 'Community', app_bmc: 'Payments', app_whatsapp: 'Messaging',
}
const CAT_ORDER = ['Social', 'Video', 'Music', 'Messaging', 'Community', 'Scheduling', 'Forms', 'Developer', 'Payments', 'Apps']

export default function AppsPage() {
  const [installed, setInstalled] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')

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

  const q = query.trim().toLowerCase()
  const apps = q ? APPS.filter((a) => a.label.toLowerCase().includes(q) || (a.appDescription || '').toLowerCase().includes(q)) : APPS
  const byCat = apps.reduce((acc, a) => { const c = APP_CATEGORY[a.type] || 'Apps'; (acc[c] ||= []).push(a); return acc }, {} as Record<string, typeof APPS>)
  const cats = CAT_ORDER.filter((c) => byCat[c]?.length)

  return (
    <div>
      <PageHeader title="App Store" subtitle="Enable third-party apps. Installed apps appear under &ldquo;Apps&rdquo; in the visual editor." />
      {!loading && <div className="mb-6 max-w-sm"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search apps…" className="input" /></div>}
      {loading ? <div className="card p-10 text-center text-sm text-slate-400">Loading…</div> : (
        <div className="space-y-8">
          {cats.map((cat) => (
            <div key={cat}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{cat}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byCat[cat].map((a) => {
                  const Icon = iconMap[a.type]
                  const on = installed.includes(a.type)
                  return (
                    <div key={a.type} className="card flex flex-col p-5">
                      <div className="mb-2 flex items-center gap-2.5">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-slate-200">{Icon ? <Icon className="h-5 w-5" /> : null}</span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
