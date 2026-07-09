'use client'

import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/widgets/AppIcon'
import { PageHeader } from '@/components/ui'
import { Check, Link2, Loader2, ExternalLink, AlertTriangle, Copy } from 'lucide-react'

interface Item {
  id: string; name: string; category: string; brand: string; description: string
  configured: boolean; connected: boolean; account: { email?: string; name?: string } | null
  clientIdEnv: string; clientSecretEnv: string; setupUrl?: string
}

export default function ConnectorsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [setupFor, setSetupFor] = useState('')
  const [origin, setOrigin] = useState('')

  async function load() { const r = await fetch('/api/connectors', { cache: 'no-store' }); setItems(r.ok ? await r.json() : []); setLoading(false) }
  useEffect(() => {
    setOrigin(window.location.origin)
    const p = new URLSearchParams(window.location.search)
    if (p.get('setup')) setSetupFor(p.get('setup')!)
    load()
  }, [])

  async function disconnect(id: string) {
    if (!confirm('Disconnect this app?')) return
    setBusy(id)
    await fetch(`/api/connect/${id}/disconnect`, { method: 'POST' })
    setBusy(''); load()
  }

  const byCat = items.reduce((acc, it) => { (acc[it.category] ||= []).push(it); return acc }, {} as Record<string, Item[]>)

  return (
    <div>
      <PageHeader title="Connectors" subtitle="Connect apps like Gmail, Drive, and Slack to power dynamic features. Credentials live in your Vercel environment." />
      {loading ? <div className="card p-10 text-center text-sm text-slate-400">Loading…</div> : (
        <div className="space-y-8">
          {Object.entries(byCat).map(([cat, list]) => (
            <div key={cat}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{cat}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((it) => (
                  <div key={it.id} className="card flex flex-col p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-slate-200"><BrandLogo slug={it.brand} className="h-5 w-5" /></span>
                      {it.connected ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">Connected</span>
                        : !it.configured ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">Setup required</span>
                        : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Not connected</span>}
                    </div>
                    <div className="font-semibold text-slate-800">{it.name}</div>
                    <p className="mt-0.5 flex-1 text-sm text-slate-500">{it.description}</p>
                    {it.connected && it.account?.email && <p className="mt-2 truncate text-xs text-slate-400">{it.account.email}</p>}

                    <div className="mt-4">
                      {it.connected ? (
                        <button onClick={() => disconnect(it.id)} disabled={busy === it.id} className="btn-outline w-full !py-2 text-xs">
                          {busy === it.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Disconnect
                        </button>
                      ) : it.configured ? (
                        <a href={`/api/connect/${it.id}`} className="btn-primary w-full justify-center !py-2 text-xs"><Link2 className="h-4 w-4" /> Connect</a>
                      ) : (
                        <button onClick={() => setSetupFor(setupFor === it.id ? '' : it.id)} className="btn-outline w-full !py-2 text-xs"><AlertTriangle className="h-4 w-4" /> Setup</button>
                      )}
                    </div>

                    {setupFor === it.id && !it.connected && (
                      <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                        <p>Add these to your Vercel project&apos;s Environment Variables, then redeploy:</p>
                        <code className="block rounded bg-white px-2 py-1 ring-1 ring-slate-200">{it.clientIdEnv}</code>
                        <code className="block rounded bg-white px-2 py-1 ring-1 ring-slate-200">{it.clientSecretEnv}</code>
                        <p className="pt-1">Redirect URI to register with the provider:</p>
                        <div className="flex items-center gap-1">
                          <code className="block flex-1 truncate rounded bg-white px-2 py-1 ring-1 ring-slate-200">{origin}/api/connect/{it.id}/callback</code>
                          <button onClick={() => navigator.clipboard?.writeText(`${origin}/api/connect/${it.id}/callback`)} className="rounded p-1 text-slate-400 hover:bg-white"><Copy className="h-3.5 w-3.5" /></button>
                        </div>
                        {it.setupUrl && <a href={it.setupUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 pt-1 text-brand-600 hover:underline">Create OAuth app <ExternalLink className="h-3 w-3" /></a>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
