'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

// Warns admins when the app is running without a database — in that mode edits
// live only in memory and won't persist or reflect on the live site (esp. on serverless).
export default function DemoBanner() {
  const [demo, setDemo] = useState(false)
  useEffect(() => {
    fetch('/api/status').then((r) => r.json()).then((d) => setDemo(!d.db)).catch(() => {})
  }, [])
  if (!demo) return null
  return (
    <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        <strong>Demo mode — no database connected.</strong> Changes you publish won&apos;t persist or show on the live site.
        Set a <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> (Vercel Postgres, Neon, or Supabase) to save your work — the schema is created automatically.
      </span>
    </div>
  )
}
