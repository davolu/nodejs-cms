'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import type { Setting } from '@/lib/seed'
import { PageHeader } from '@/components/ui'

interface Link { label: string; href: string }
const parse = (v: string | undefined, fallback: Link[]): Link[] => {
  try { const p = JSON.parse(v || ''); return Array.isArray(p) ? p : fallback } catch { return fallback }
}

export default function NavigationPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [nav, setNav] = useState<Link[]>([])
  const [footer, setFooter] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()).then((s: Setting[]) => {
      const map = Object.fromEntries(s.map((x) => [x.key, x.value]))
      setValues(map)
      setNav(parse(map.nav_menu, []))
      setFooter(parse(map.footer_links, []))
      setLoading(false)
    })
  }, [])

  async function save() {
    setSaving(true); setSaved(false)
    const entries = [
      { key: 'nav_menu', value: JSON.stringify(nav.filter((l) => l.label && l.href)) },
      { key: 'footer_links', value: JSON.stringify(footer.filter((l) => l.label && l.href)) },
      { key: 'header_cta_label', value: values.header_cta_label || '' },
      { key: 'header_cta_href', value: values.header_cta_href || '' },
      { key: 'footer_text', value: values.footer_text || '' },
    ]
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entries }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader title="Navigation" subtitle="Customize your site's header menu, call-to-action, and footer."
        action={<button onClick={save} disabled={saving || loading} className="btn-primary shrink-0"><Save className="h-4 w-4" /> {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}</button>} />

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading…</div>
      ) : (
        <div className="max-w-2xl space-y-4">
          <LinkList title="Header menu" hint="Links shown in your site header. Leave empty to auto-list published pages." items={nav} setItems={setNav} />

          <div className="card space-y-3 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Header button</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Label</label><input className="input" value={values.header_cta_label ?? ''} onChange={(e) => setValues((v) => ({ ...v, header_cta_label: e.target.value }))} placeholder="Read the blog" /></div>
              <div><label className="label">Link</label><input className="input" value={values.header_cta_href ?? ''} onChange={(e) => setValues((v) => ({ ...v, header_cta_href: e.target.value }))} placeholder="/blog" /></div>
            </div>
          </div>

          <div className="card space-y-3 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Footer</h3>
            <div><label className="label">Footer text</label><textarea className="input" value={values.footer_text ?? ''} onChange={(e) => setValues((v) => ({ ...v, footer_text: e.target.value }))} placeholder="A short line about your site." /></div>
          </div>

          <LinkList title="Footer links" hint="Extra links shown in the footer." items={footer} setItems={setFooter} />
        </div>
      )}
    </div>
  )
}

function LinkList({ title, hint, items, setItems }: { title: string; hint: string; items: Link[]; setItems: (v: Link[]) => void }) {
  const set = (i: number, patch: Partial<Link>) => setItems(items.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= items.length) return; const next = [...items];[next[i], next[j]] = [next[j], next[i]]; setItems(next) }
  return (
    <div className="card space-y-3 p-5">
      <div><h3 className="text-sm font-semibold text-slate-900">{title}</h3><p className="text-xs text-slate-400">{hint}</p></div>
      {items.map((l, i) => (
        <div key={i} className="flex gap-2">
          <input className="input" value={l.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="Label" />
          <input className="input" value={l.href} onChange={(e) => set(i, { href: e.target.value })} placeholder="/about or https://…" />
          <div className="flex shrink-0">
            <button onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost !px-1.5 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="btn-ghost !px-1.5 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="btn-danger !px-2"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
      <button onClick={() => setItems([...items, { label: '', href: '' }])} className="btn-outline !py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Add link</button>
    </div>
  )
}
