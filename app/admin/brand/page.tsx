'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui'
import { Sparkles, Loader2, Save, Palette } from 'lucide-react'
import type { Setting } from '@/lib/seed'

const HEADING_FONTS = ['Space Grotesk', 'Poppins', 'Sora', 'Outfit', 'Manrope', 'Montserrat', 'Playfair Display', 'Fraunces', 'DM Serif Display', 'Bricolage Grotesque', 'Instrument Serif', 'Inter']
const BODY_FONTS = ['Inter', 'Manrope', 'DM Sans', 'Work Sans', 'Source Sans 3', 'Nunito Sans', 'Figtree', 'Roboto', 'System']
const DEFAULT = { primary: '#4f46e5', accent: '#d946ef', bg: '#ffffff', surface: '#ffffff', text: '#334155', heading: '#0f172a', headingFont: 'Space Grotesk', bodyFont: 'Inter', radius: 16, buttonStyle: 'pill' as const, applyAll: true }

const COLORS: { key: keyof typeof DEFAULT; label: string }[] = [
  { key: 'primary', label: 'Primary' }, { key: 'accent', label: 'Accent' }, { key: 'bg', label: 'Background' },
  { key: 'surface', label: 'Surface' }, { key: 'text', label: 'Body text' }, { key: 'heading', label: 'Heading' },
]

export default function BrandStudio() {
  const [b, setB] = useState<any>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [gen, setGen] = useState(false)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()).then((s: Setting[]) => {
      try { const v = JSON.parse(s.find((x) => x.key === 'brand')?.value || '{}'); setB({ ...DEFAULT, ...v }) } catch {}
      setLoading(false)
    })
  }, [])

  const set = (k: string, v: any) => setB((x: any) => ({ ...x, [k]: v }))
  const fontLink = () => {
    const fams = Array.from(new Set([b.headingFont, b.bodyFont])).filter((f) => f && f !== 'System')
    return fams.length ? `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700`).join('&')}&display=swap` : ''
  }
  const btnRadius = b.buttonStyle === 'pill' ? 999 : b.buttonStyle === 'square' ? 4 : Math.min(b.radius, 14)

  async function generate() {
    if (!prompt.trim()) return
    setGen(true)
    const r = await fetch('/api/ai/brand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
    const d = await r.json()
    if (d.brand) setB({ ...DEFAULT, ...d.brand })
    setGen(false)
  }
  async function save() {
    setSaving(true); setSaved(false)
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entries: [{ key: 'brand', value: JSON.stringify(b) }] }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="card p-10 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div>
      {fontLink() && <link rel="stylesheet" href={fontLink()} />}
      <PageHeader title="Brand Studio" subtitle="Define your brand style guide — colors, typography, and shape. Your whole site renders from it."
        action={<button onClick={save} disabled={saving} className="btn-primary shrink-0"><Save className="h-4 w-4" /> {saving ? 'Saving…' : saved ? 'Saved' : 'Save brand'}</button>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          {/* AI generate */}
          <div className="card p-5">
            <div className="mb-2 flex items-center gap-2 font-semibold text-slate-800"><Sparkles className="h-4 w-4 text-brand-500" /> Generate with AI</div>
            <div className="flex gap-2">
              <input className="input" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. calm, premium wellness brand — sage green, elegant serif" />
              <button onClick={generate} disabled={gen || !prompt.trim()} className="btn-primary shrink-0">{gen ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}</button>
            </div>
          </div>

          {/* Colors */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 font-semibold text-slate-800"><Palette className="h-4 w-4" /> Colors</div>
            <div className="grid grid-cols-2 gap-3">
              {COLORS.map((c) => (
                <div key={c.key} className="flex items-center gap-2">
                  <input type="color" value={b[c.key]} onChange={(e) => set(c.key, e.target.value)} className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-slate-200" />
                  <div className="min-w-0"><div className="text-sm font-medium text-slate-700">{c.label}</div><div className="truncate text-xs text-slate-400">{b[c.key]}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography + shape */}
          <div className="card space-y-4 p-5">
            <div className="font-semibold text-slate-800">Typography &amp; shape</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Heading font</label><select className="input" value={b.headingFont} onChange={(e) => set('headingFont', e.target.value)}>{HEADING_FONTS.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div><label className="label">Body font</label><select className="input" value={b.bodyFont} onChange={(e) => set('bodyFont', e.target.value)}>{BODY_FONTS.map((f) => <option key={f}>{f}</option>)}</select></div>
            </div>
            <div>
              <label className="label">Corner radius — {b.radius}px</label>
              <input type="range" min={0} max={24} value={b.radius} onChange={(e) => set('radius', Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="label">Button style</label>
              <div className="flex gap-2">
                {['rounded', 'pill', 'square'].map((s) => (
                  <button key={s} onClick={() => set('buttonStyle', s)} className={`flex-1 rounded-lg border px-3 py-1.5 text-sm capitalize ${b.buttonStyle === s ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'}`}>{s}</button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
              <input type="checkbox" checked={b.applyAll !== false} onChange={(e) => set('applyAll', e.target.checked)} />
              Apply brand to all pages <span className="text-xs text-slate-400">(override individual page themes)</span>
            </label>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Live preview</div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ background: b.bg, color: b.text, fontFamily: `'${b.bodyFont}', system-ui, sans-serif` }}>
            <div className="p-8" style={{ backgroundImage: `linear-gradient(120deg, ${b.primary}, ${b.accent})`, color: '#fff' }}>
              <div className="text-xs font-medium opacity-80" style={{ fontFamily: `'${b.bodyFont}', sans-serif` }}>YOUR BRAND</div>
              <h2 className="mt-2 text-3xl font-bold" style={{ fontFamily: `'${b.headingFont}', system-ui, sans-serif` }}>Design that feels like you.</h2>
              <p className="mt-2 max-w-sm text-sm text-white/85">A cohesive palette and type system applied across every page.</p>
              <button className="mt-4 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/40" style={{ borderRadius: btnRadius }}>Get started</button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold" style={{ fontFamily: `'${b.headingFont}', system-ui, sans-serif`, color: b.heading }}>A section heading</h3>
              <p className="mt-1.5 text-sm" style={{ color: b.text }}>Body copy uses your chosen typeface and color, so the whole site reads as one brand.</p>
              <div className="mt-4 flex gap-3">
                <div className="flex-1 p-4 shadow-sm" style={{ background: b.surface, borderRadius: b.radius, border: '1px solid rgba(0,0,0,.06)' }}>
                  <div className="text-sm font-semibold" style={{ color: b.heading }}>Card title</div>
                  <div className="mt-1 text-xs" style={{ color: b.text }}>Surface color + radius.</div>
                </div>
                <button className="px-5 text-sm font-semibold text-white" style={{ backgroundImage: `linear-gradient(120deg, ${b.primary}, ${b.accent})`, borderRadius: btnRadius }}>Button</button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Saved changes apply to your public site immediately.</p>
        </div>
      </div>
    </div>
  )
}
