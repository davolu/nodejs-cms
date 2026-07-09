'use client'

import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/widgets/AppIcon'
import { PageHeader } from '@/components/ui'
import { Save, Zap, Link2 } from 'lucide-react'
import Link from 'next/link'
import type { Setting } from '@/lib/seed'

interface ConnItem { id: string; connected: boolean }
type Auto = Record<string, any>

const APPS = [
  { key: 'gmail', connector: 'gmail', brand: 'gmail', name: 'Gmail', desc: 'Email each submission to you.', fields: [{ k: 'to', label: 'Send to', placeholder: 'you@example.com' }] },
  { key: 'slack', connector: 'slack', brand: 'slack', name: 'Slack', desc: 'Post each submission to a channel.', fields: [{ k: 'channel', label: 'Channel ID', placeholder: 'C0123456789' }] },
  { key: 'sheets', connector: 'google-sheets', brand: 'googlesheets', name: 'Google Sheets', desc: 'Append each submission as a row.', fields: [{ k: 'spreadsheetId', label: 'Spreadsheet ID', placeholder: 'from the sheet URL' }, { k: 'range', label: 'Range (optional)', placeholder: 'Sheet1!A1' }] },
  { key: 'hubspot', connector: 'hubspot', brand: 'hubspot', name: 'HubSpot', desc: 'Create/update a contact from the email field.', fields: [] },
  { key: 'mailchimp', connector: 'mailchimp', brand: 'mailchimp', name: 'Mailchimp', desc: 'Add the submitter to a Mailchimp audience.', fields: [{ k: 'listId', label: 'Audience (List) ID', placeholder: 'e.g. a1b2c3d4e5' }] },
  { key: 'webhook', connector: 'webhook', brand: 'webhook', name: 'Webhook', desc: 'POST the submission JSON to any URL (Zapier, Make, n8n…).', fields: [{ k: 'url', label: 'Webhook URL', placeholder: 'https://…' }], always: true },
]

export default function AutomationsPage() {
  const [auto, setAuto] = useState<Auto>({})
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/connectors', { cache: 'no-store' }).then((r) => r.json()),
    ]).then(([s, conns]: [Setting[], any[]]) => {
      try { setAuto(JSON.parse(s.find((x) => x.key === 'form_automations')?.value || '{}')) } catch { setAuto({}) }
      const list = Array.isArray(conns) ? conns : []
      setItems(list)
      setConnected(new Set(list.filter((c) => c.connected).map((c) => c.id)))
      setLoading(false)
    })
  }, [])

  const set = (app: string, patch: any) => setAuto((a) => ({ ...a, [app]: { ...a[app], ...patch } }))
  const setCustom = (key: string, enabled: boolean) => setAuto((a) => ({ ...a, custom: { ...(a.custom || {}), [key]: { enabled } } }))
  const customActions = items.filter((it) => it.custom && it.connected).flatMap((it) => (it.actions || []).filter((a: any) => a.id.startsWith('custom:')).map((a: any) => ({ ...a, connectorName: it.name, brand: it.brand })))

  async function save() {
    setSaving(true); setSaved(false)
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entries: [{ key: 'form_automations', value: JSON.stringify(auto) }] }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader title="Automations" subtitle="When a form is submitted, forward it to your connected apps."
        action={<button onClick={save} disabled={saving || loading} className="btn-primary shrink-0"><Save className="h-4 w-4" /> {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}</button>} />
      {loading ? <div className="card p-10 text-center text-sm text-slate-400">Loading…</div> : (
        <div className="max-w-2xl space-y-4">
          {APPS.map((app) => {
            const on = !!auto[app.key]?.enabled
            const isConn = (app as any).always || connected.has(app.connector)
            return (
              <div key={app.key} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-slate-200"><BrandLogo slug={app.brand} className="h-5 w-5" /></span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{app.name}</div>
                    <div className="text-xs text-slate-400">{app.desc}</div>
                  </div>
                  {isConn ? (
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" checked={on} onChange={(e) => set(app.key, { enabled: e.target.checked })} /> Enabled
                    </label>
                  ) : (
                    <Link href="/admin/connectors" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"><Link2 className="h-3.5 w-3.5" /> Connect first</Link>
                  )}
                </div>
                {on && isConn && app.fields.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {app.fields.map((f) => (
                      <div key={f.k}>
                        <label className="label">{f.label}</label>
                        <input className="input" value={auto[app.key]?.[f.k] ?? ''} onChange={(e) => set(app.key, { [f.k]: e.target.value })} placeholder={f.placeholder} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {customActions.length > 0 && (
            <div className="pt-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Custom connector actions</h2>
              {customActions.map((a) => (
                <div key={a.id} className="card mb-3 flex items-center gap-3 p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-slate-200"><BrandLogo slug={a.brand} className="h-5 w-5" /></span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{a.label}</div>
                    <div className="text-xs text-slate-400">{a.connectorName} · fields map from {'{{placeholders}}'} to form data</div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={!!auto.custom?.[a.id]?.enabled} onChange={(e) => setCustom(a.id, e.target.checked)} /> Enabled
                  </label>
                </div>
              ))}
            </div>
          )}
          <p className="flex items-center gap-1.5 text-xs text-slate-400"><Zap className="h-3.5 w-3.5" /> Automations run on every Contact Form / Newsletter submission. Failures never block the submission.</p>
        </div>
      )}
    </div>
  )
}
