import { Lock } from 'lucide-react'
import { themeVars } from '@/lib/blocks'
import WidgetRenderer from '@/components/widgets/WidgetRenderer'
import type { Block } from '@/lib/blocks'

const authBlock: Block = { id: 'gate-auth', type: 'authform', props: { heading: '' } }

export default function MembersGate({ title, theme }: { title: string; theme?: string }) {
  return (
    <div style={themeVars(theme) as React.CSSProperties} className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full text-white" style={{ backgroundImage: 'linear-gradient(120deg, var(--from), var(--to))' }}>
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="site-heading text-2xl font-bold text-slate-900">Members only</h1>
      <p className="mt-2 text-slate-500">Sign in or create an account to view “{title}”.</p>
      <WidgetRenderer block={authBlock} />
    </div>
  )
}
