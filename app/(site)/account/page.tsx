'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserRound, CheckCircle2, Loader2 } from 'lucide-react'

interface Me { id: string; email: string; name: string; subscribed: boolean; plan: string }

export default function AccountPage({ searchParams }: { searchParams: { sub?: string; session_id?: string } }) {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function run() {
      if (searchParams.session_id) {
        await fetch('/api/subscribe/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: searchParams.session_id }) }).catch(() => {})
      }
      const d = await fetch('/api/member/me', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ user: null }))
      setMe(d.user); setLoading(false)
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function logout() { await fetch('/api/member/logout', { method: 'POST' }); window.location.href = '/' }

  if (loading) return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>

  if (!me) return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="site-heading text-2xl font-bold text-slate-900">You&apos;re signed out</h1>
      <p className="mt-2 text-slate-500">Sign in from any page with a Login / Signup widget.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Back home</Link>
    </div>
  )

  const justSubscribed = searchParams.sub === 'success' || searchParams.sub === 'demo'

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500"><UserRound className="h-5 w-5" /></span>
        <div>
          <h1 className="site-heading text-xl font-bold text-slate-900">{me.name || me.email}</h1>
          <p className="text-sm text-slate-400">{me.email}</p>
        </div>
      </div>

      {justSubscribed && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-5 w-5" /> Subscription active{searchParams.sub === 'demo' ? ' (demo)' : ''}. Enjoy your access!
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold text-slate-900">Membership</div>
        {me.subscribed ? (
          <p className="mt-1 text-sm text-slate-600">Active{me.plan ? ` — ${me.plan} plan` : ''}. You have access to subscriber content.</p>
        ) : (
          <p className="mt-1 text-sm text-slate-600">No active subscription. Visit a page with a Pricing Plans widget to subscribe.</p>
        )}
      </div>

      <button onClick={logout} className="mt-6 text-sm text-slate-500 hover:text-slate-800">Sign out</button>
    </div>
  )
}
