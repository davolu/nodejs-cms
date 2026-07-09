import { ShieldAlert } from 'lucide-react'
import { themeVars } from '@/lib/blocks'

export default function RoleGate({ title, theme, required }: { title: string; theme?: string; required: string }) {
  return (
    <div style={themeVars(theme) as React.CSSProperties} className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full text-white" style={{ backgroundImage: 'linear-gradient(120deg, var(--from), var(--to))' }}>
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h1 className="site-heading text-2xl font-bold text-slate-900">Restricted</h1>
      <p className="mt-2 text-slate-500">“{title}” is available to {required === 'admin' ? 'admins' : 'managers and admins'} only. Your account doesn’t have access.</p>
      <a href="/account" className="mt-6 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundImage: 'linear-gradient(120deg, var(--from), var(--to))' }}>Back to your account</a>
    </div>
  )
}
