import Link from 'next/link'

type LinkAction = { label: string; href: string }

function isLinkAction(a: unknown): a is LinkAction {
  return typeof a === 'object' && a !== null && 'href' in a && 'label' in a
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: LinkAction | React.ReactNode
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {isLinkAction(action) ? (
        <Link href={action.href} className="btn-primary shrink-0">
          {action.label}
        </Link>
      ) : (
        (action as React.ReactNode)
      )}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const published = status === 'published'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="card grid place-items-center px-6 py-16 text-center">
      <h3 className="text-base font-medium text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
