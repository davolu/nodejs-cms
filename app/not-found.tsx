import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="card grid place-items-center px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">404</h1>
      <p className="mt-2 text-sm text-slate-500">That content doesn’t exist or was deleted.</p>
      <Link href="/" className="btn-primary mt-4">Back to dashboard</Link>
    </div>
  )
}
