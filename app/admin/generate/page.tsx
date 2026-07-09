'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui'
import { Sparkles, Loader2, ExternalLink, Pencil, ArrowRight, Check, Database, FileText, Compass } from 'lucide-react'
import Link from 'next/link'

const EXAMPLES = [
  'A yoga studio with class schedule, memberships, and an about page',
  'A startup jobs board where members can post jobs',
  'A photographer portfolio with a bookings page and packages',
  'A coffee shop with a menu, reviews, and a visit page',
  'A SaaS marketing site with features, pricing, and a contact form',
]

interface Step { step: string; message: string }
const stepIcon = (s: string) => (s === 'collection' ? Database : s === 'page' ? FileText : s === 'nav' ? Compass : Check)

export default function GenerateSitePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [current, setCurrent] = useState('')

  async function build() {
    if (!prompt.trim()) return
    setLoading(true); setError(''); setResult(null); setSteps([]); setCurrent('Planning your site with AI…')
    try {
      const res = await fetch('/api/ai/generate-site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      if (!res.ok || !res.body) { const d = await res.json().catch(() => ({})); setError(d.error || 'Could not build the site.'); setLoading(false); return }
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          let ev: any; try { ev = JSON.parse(line) } catch { continue }
          if (ev.step === 'thinking') { setCurrent(ev.message) }
          else if (ev.step === 'done') { setResult(ev.result); setCurrent('') }
          else if (ev.step === 'error') { setError(ev.message); setCurrent('') }
          else { setSteps((s) => [...s, ev]); setCurrent('') }
        }
      }
    } catch { setError('The connection dropped. Try again.') }
    setLoading(false); setCurrent('')
  }

  return (
    <div>
      <PageHeader title="Build with AI" subtitle="Describe the site you want. AI plans the pages, navigation, collections, and widgets — then builds it." />

      {!result ? (
        <div className="max-w-2xl">
          <div className="card p-6">
            <label className="label">What site do you want?</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={loading} rows={4}
              className="input" placeholder="e.g. A membership community for runners in Lagos with events, a members hub, and a join page" />
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => setPrompt(ex)} disabled={loading} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50">{ex}</button>
              ))}
            </div>
            <button onClick={build} disabled={loading || !prompt.trim()} className="btn-primary mt-4">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Building your site…</> : <><Sparkles className="h-4 w-4" /> Build my site</>}
            </button>
            {(loading || steps.length > 0) && (
              <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                {steps.map((s, i) => {
                  const Icon = stepIcon(s.step)
                  return (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Icon className="h-3 w-3" /></span>
                      {s.message}
                    </div>
                  )
                })}
                {loading && current && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-500" /> {current}
                  </div>
                )}
              </div>
            )}
            {loading && !current && steps.length === 0 && <p className="mt-2 text-xs text-slate-400">This can take up to a minute.</p>}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
          <p className="mt-3 text-xs text-slate-400">Note: this adds new pages, navigation, and collections to your site. You can edit or delete anything afterward.</p>
        </div>
      ) : (
        <div className="max-w-2xl space-y-5">
          <div className="card border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-2 text-emerald-700"><Sparkles className="h-5 w-5" /><span className="font-semibold">Your site “{result.site?.title || 'site'}” is ready</span></div>
            <p className="mt-1 text-sm text-emerald-600">Created {result.pages?.length || 0} page{result.pages?.length === 1 ? '' : 's'}{result.collections?.length ? ` and ${result.collections.length} collection${result.collections.length === 1 ? '' : 's'}` : ''}.</p>
            <div className="mt-4 flex gap-2">
              <a href="/" target="_blank" rel="noopener noreferrer" className="btn-primary"><ExternalLink className="h-4 w-4" /> View site</a>
              <button onClick={() => { setResult(null); setPrompt('') }} className="btn-outline">Build another</button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Pages</div>
            <ul className="divide-y divide-slate-100">
              {result.pages?.map((p: any) => (
                <li key={p.slug} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <span className="font-medium text-slate-800">{p.title}</span>
                    {p.home && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">Home</span>}
                    <span className="ml-2 text-xs text-slate-400">/{p.slug}</span>
                  </div>
                  <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-600"><ArrowRight className="h-4 w-4" /></a>
                </li>
              ))}
            </ul>
          </div>

          {result.collections?.length > 0 && (
            <div className="card p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Collections</div>
              <div className="flex flex-wrap gap-2">
                {result.collections.map((c: string) => <span key={c} className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-600">{c}</span>)}
              </div>
            </div>
          )}

          <Link href="/admin/pages" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"><Pencil className="h-4 w-4" /> Edit pages in the builder</Link>
        </div>
      )}
    </div>
  )
}
