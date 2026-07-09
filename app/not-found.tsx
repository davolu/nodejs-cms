import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
      <div>
        <h1 className="text-4xl font-semibold text-slate-900">404</h1>
        <p className="mt-2 text-sm text-slate-500">That page doesn’t exist or was unpublished.</p>
        <Link href="/" className="btn-primary mt-4">Back to home</Link>
      </div>
    </div>
  )
}
