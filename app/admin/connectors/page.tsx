'use client'

import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/widgets/AppIcon'
import { PageHeader } from '@/components/ui'
import { Check, Link2, Loader2, ExternalLink, AlertTriangle, Copy, Play, X } from 'lucide-react'

interface Action { id: string; label: string; sample?: any }
interface Item {
  id: string; name: string; category: string; brand: string; description: string
  auth: string; apikey: boolean; rest?: boolean; custom?: boolean
  configured: boolean; connected: boolean; account: { email?: string; name?: string } | null
  clientIdEnv?: string; clientSecretEnv?: string; apiKeyEnv: string[]; setupUrl?: string
  actions: Action[]
}

export default function ConnectorsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [setupFor, setSetupFor] = useState('')
  const [origin, setOrigin] = useState('')
  const [test, setTest] = useState<Item | null>(null)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)

  async function load() { const r = await fetch('/api/connectors', { cache: 'no-store' }); setItems(r.ok ? await r.json() : []); setLoading(false) }
  useEffect(() => {
    setOrigin(window.location.origin)
    const p = new URLSearchParams(window.location.search)
    if (p.get('setup')) setSetupFor(p.get('setup')!)
    load()
  }, [])

  async function disconnect(id: string) {
    if (!confirm('Disconnect this app?')) return
    setBusy(id); await fetch(`/api/connect/${id}/disconnect`, { method: 'POST' }); setBusy(''); load()
  }
  async function removeCustom(id: string) {
    if (!confirm('Delete this custom connector?')) return
    await fetch(`/api/connectors/custom?id=${encodeURIComponent(id)}`, { method: 'DELETE' }); load()
  }

  const q = query.trim().toLowerCase()
  const filtered = q ? items.filter((it) => it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q)) : items
  const byCat = filtered.reduce((acc, it) => { (acc[it.category] ||= []).push(it); return acc }, {} as Record<string, Item[]>)

  return (
    <div>
      <PageHeader title="Connectors" subtitle="Connect apps like Gmail, Drive, and Slack to power dynamic features. Credentials live in your Vercel environment."
        action={<button onClick={() => setAdding(true)} className="btn-primary shrink-0">+ Add connector</button>} />
      {!loading && (
        <div className="relative mb-6 max-w-sm">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search connectors…" className="input" />
        </div>
      )}
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
                      <div className="flex items-center gap-1.5">
                        {it.custom && <button onClick={() => removeCustom(it.id)} className="rounded p-1 text-slate-300 hover:text-red-500" title="Delete custom connector"><X className="h-4 w-4" /></button>}
                        {it.connected ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">Connected</span>
                          : !it.configured ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">Setup required</span>
                          : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Not connected</span>}
                      </div>
                    </div>
                    <div className="font-semibold text-slate-800">{it.name}</div>
                    <p className="mt-0.5 flex-1 text-sm text-slate-500">{it.description}</p>
                    {it.connected && it.account?.email && <p className="mt-2 truncate text-xs text-slate-400">{it.account.email}</p>}
                    {it.connected && it.apikey && <p className="mt-2 text-xs text-slate-400">Configured via environment</p>}

                    <div className="mt-4 flex gap-2">
                      {it.connected ? (
                        <>
                          {it.actions.length > 0 && <button onClick={() => setTest(it)} className="btn-outline flex-1 justify-center !py-2 text-xs"><Play className="h-3.5 w-3.5" /> Test</button>}
                          {!it.apikey && <button onClick={() => disconnect(it.id)} disabled={busy === it.id} className="btn-outline flex-1 justify-center !py-2 text-xs">{busy === it.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Disconnect</button>}
                        </>
                      ) : it.apikey ? (
                        <button onClick={() => setSetupFor(setupFor === it.id ? '' : it.id)} className="btn-outline w-full !py-2 text-xs"><AlertTriangle className="h-4 w-4" /> Add API key</button>
                      ) : it.configured ? (
                        <a href={`/api/connect/${it.id}`} className="btn-primary w-full justify-center !py-2 text-xs"><Link2 className="h-4 w-4" /> Connect</a>
                      ) : (
                        <button onClick={() => setSetupFor(setupFor === it.id ? '' : it.id)} className="btn-outline w-full !py-2 text-xs"><AlertTriangle className="h-4 w-4" /> Setup</button>
                      )}
                    </div>

                    {setupFor === it.id && !it.connected && (
                      <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                        <p>Add {it.apikey ? 'this to' : 'these to'} your Vercel project&apos;s Environment Variables, then redeploy:</p>
                        {it.apikey
                          ? it.apiKeyEnv.map((e) => <code key={e} className="block rounded bg-white px-2 py-1 ring-1 ring-slate-200">{e}</code>)
                          : <>
                              <code className="block rounded bg-white px-2 py-1 ring-1 ring-slate-200">{it.clientIdEnv}</code>
                              <code className="block rounded bg-white px-2 py-1 ring-1 ring-slate-200">{it.clientSecretEnv}</code>
                              <p className="pt-1">Redirect URI to register with the provider:</p>
                              <div className="flex items-center gap-1">
                                <code className="block flex-1 truncate rounded bg-white px-2 py-1 ring-1 ring-slate-200">{origin}/api/connect/{it.id}/callback</code>
                                <button onClick={() => navigator.clipboard?.writeText(`${origin}/api/connect/${it.id}/callback`)} className="rounded p-1 text-slate-400 hover:bg-white"><Copy className="h-3.5 w-3.5" /></button>
                              </div>
                            </>}
                        {it.setupUrl && <a href={it.setupUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 pt-1 text-brand-600 hover:underline">{it.apikey ? 'Get your API key' : 'Create OAuth app'} <ExternalLink className="h-3 w-3" /></a>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {test && <TestPanel item={test} onClose={() => setTest(null)} />}
      {adding && <AddConnectorModal onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load() }} />}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <div><label className="label">{label}</label><input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></div>
}

function AddConnectorModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<'oauth2' | 'rest'>('oauth2')
  const [f, setF] = useState<any>({ name: '', category: 'Custom', description: '', authorizeUrl: '', tokenUrl: '', clientId: '', clientSecret: '', scopes: '', tokenAuth: 'body', pkce: false, userInfoUrl: '', baseUrl: '', restAuthHeader: 'Authorization', restAuthValue: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }))

  async function save() {
    setSaving(true); setError('')
    const res = await fetch('/api/connectors/custom', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, type }) })
    const d = await res.json().catch(() => ({}))
    setSaving(false)
    if (res.ok) onSaved(); else setError(d.error || 'Could not save.')
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Add a connector</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mb-4 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-sm">
          <button onClick={() => setType('oauth2')} className={`flex-1 rounded-md py-1.5 font-medium ${type === 'oauth2' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Generic OAuth2</button>
          <button onClick={() => setType('rest')} className={`flex-1 rounded-md py-1.5 font-medium ${type === 'rest' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Generic REST / API key</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={f.name} onChange={(v) => set('name', v)} placeholder="e.g. Todoist" />
            <Field label="Category" value={f.category} onChange={(v) => set('category', v)} placeholder="Productivity" />
          </div>
          <Field label="Description" value={f.description} onChange={(v) => set('description', v)} />
          {type === 'oauth2' ? (
            <>
              <Field label="Authorize URL" value={f.authorizeUrl} onChange={(v) => set('authorizeUrl', v)} placeholder="https://provider.com/oauth/authorize" />
              <Field label="Token URL" value={f.tokenUrl} onChange={(v) => set('tokenUrl', v)} placeholder="https://provider.com/oauth/token" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Client ID" value={f.clientId} onChange={(v) => set('clientId', v)} />
                <Field label="Client Secret" value={f.clientSecret} onChange={(v) => set('clientSecret', v)} />
              </div>
              <Field label="Scopes (space-separated)" value={f.scopes} onChange={(v) => set('scopes', v)} placeholder="read write" />
              <Field label="User info URL (optional)" value={f.userInfoUrl} onChange={(v) => set('userInfoUrl', v)} />
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <label className="flex items-center gap-2"><input type="checkbox" checked={f.pkce} onChange={(e) => set('pkce', e.target.checked)} /> Use PKCE</label>
                <label className="flex items-center gap-2">Token auth
                  <select className="input !py-1" value={f.tokenAuth} onChange={(e) => set('tokenAuth', e.target.value)}><option value="body">Body</option><option value="basic">Basic</option></select>
                </label>
              </div>
              <p className="text-xs text-slate-400">Redirect URI to register: <code className="rounded bg-slate-100 px-1">{typeof window !== 'undefined' ? window.location.origin : ''}/api/connect/custom-&lt;name&gt;/callback</code></p>
            </>
          ) : (
            <>
              <Field label="Base URL" value={f.baseUrl} onChange={(v) => set('baseUrl', v)} placeholder="https://api.provider.com/v1" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Auth header" value={f.restAuthHeader} onChange={(v) => set('restAuthHeader', v)} placeholder="Authorization" />
                <Field label="Auth value" value={f.restAuthValue} onChange={(v) => set('restAuthValue', v)} placeholder="Bearer sk_xxx" />
              </div>
              <p className="text-xs text-slate-400">Once saved, use the Test panel to send requests (method + path + body).</p>
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Add connector'}</button>
        </div>
      </div>
    </div>
  )
}

function TestPanel({ item, onClose }: { item: Item; onClose: () => void }) {
  const [actionId, setActionId] = useState(item.actions[0]?.id || '')
  const action = item.actions.find((a) => a.id === actionId)
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => { setInput(JSON.stringify(action?.sample ?? {}, null, 2)); setResult('') }, [actionId]) // eslint-disable-line

  async function run() {
    setRunning(true); setResult('')
    let body: any = {}
    try { body = JSON.parse(input || '{}') } catch { setResult('Input is not valid JSON.'); setRunning(false); return }
    const res = await fetch(`/api/actions/${actionId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await res.json().catch(() => ({}))
    setResult(JSON.stringify(d, null, 2)); setRunning(false)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><BrandLogo slug={item.brand} className="h-5 w-5" /><h2 className="text-lg font-bold text-slate-900">Test {item.name}</h2></div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <label className="label">Action</label>
        <select className="input" value={actionId} onChange={(e) => setActionId(e.target.value)}>
          {item.actions.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
        <label className="label mt-3">Input (JSON)</label>
        <textarea className="input min-h-[140px] font-mono text-xs" value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={run} disabled={running} className="btn-primary mt-3 w-full justify-center">{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run action</button>
        {result && <pre className="mt-3 max-h-56 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">{result}</pre>}
      </div>
    </div>
  )
}
