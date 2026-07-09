'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Layers, Lock } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/admin'

  const [email, setEmail] = useState('admin@acme.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push(next)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Login failed.')
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
            <Layers className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold text-slate-900">ContentHub</span>
        </div>

        <form onSubmit={submit} className="card p-6">
          <h1 className="text-lg font-semibold text-slate-900">Sign in to your CMS</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your pages, posts, and media.</p>

          <label className="label mt-5">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />

          <label className="label mt-4">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
            <Lock className="h-4 w-4" /> {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
            Demo login — <span className="font-medium text-slate-700">admin@acme.com</span> / <span className="font-medium text-slate-700">admin123</span>
          </p>
        </form>
      </div>
    </div>
  )
}
