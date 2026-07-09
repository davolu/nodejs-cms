'use client'

import { useEffect, useState } from 'react'
import { Lock, Check, Loader2 } from 'lucide-react'
import { themeVars } from '@/lib/blocks'

interface Plan { id: string; name: string; priceCents: number; interval: string; description?: string; features?: string[] }
const money = (c: number) => `$${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}`

export default function Paywall({ title, theme }: { title: string; theme?: string }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { fetch('/api/plans').then((r) => r.json()).then((d) => setPlans(Array.isArray(d) ? d : [])).catch(() => {}) }, [])

  async function subscribe(planId: string) {
    setBusy(planId); setError('')
    const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.url) { window.location.href = d.url; return }
    setError(d.error || 'Could not start checkout.'); setBusy('')
  }

  return (
    <div style={themeVars(theme) as React.CSSProperties} className="mx-auto max-w-4xl px-6 py-16 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full text-white" style={{ backgroundImage: 'linear-gradient(120deg, var(--from), var(--to))' }}>
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="site-heading text-2xl font-bold text-slate-900">Subscribers only</h1>
      <p className="mt-2 text-slate-500">Subscribe to unlock “{title}” and all premium content.</p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
            <div className="site-heading text-lg font-bold text-slate-900">{p.name}</div>
            <div className="mt-1"><span className="site-heading text-3xl font-bold" style={{ color: 'var(--solid)' }}>{money(p.priceCents)}</span><span className="text-sm text-slate-400">/{p.interval}</span></div>
            {p.description && <p className="mt-2 text-sm text-slate-500">{p.description}</p>}
            {p.features && (
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                {p.features.map((f, i) => <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--solid)' }} /> {f}</li>)}
              </ul>
            )}
            <button onClick={() => subscribe(p.id)} disabled={!!busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundImage: 'linear-gradient(120deg, var(--from), var(--to))' }}>
              {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
