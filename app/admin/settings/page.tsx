'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import type { Setting } from '@/lib/seed'
import { PageHeader } from '@/components/ui'

const LABELS: Record<string, { label: string; hint: string }> = {
  site_title: { label: 'Site title', hint: 'Appears in the browser tab and search results.' },
  site_description: { label: 'Site description', hint: 'Default meta description for the site.' },
  site_url: { label: 'Site URL', hint: 'The public address of your website.' },
  posts_per_page: { label: 'Posts per page', hint: 'How many posts show on listing pages.' },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: Setting[]) => {
        setSettings(data)
        setValues(Object.fromEntries(data.map((s) => [s.key, s.value])))
        setLoading(false)
      })
  }, [])

  async function save() {
    setSaving(true)
    setSaved(false)
    const entries = Object.entries(values).map(([key, value]) => ({ key, value }))
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="General configuration for your site."
        action={
          <button onClick={save} disabled={saving || loading} className="btn-primary shrink-0">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
          </button>
        }
      />

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading settings…</div>
      ) : (
        <div className="card max-w-2xl divide-y divide-slate-100">
          {settings.map((s) => {
            const meta = LABELS[s.key] ?? { label: s.key, hint: '' }
            return (
              <div key={s.key} className="grid gap-2 p-5 sm:grid-cols-3 sm:items-center">
                <div className="sm:col-span-1">
                  <div className="text-sm font-medium text-slate-800">{meta.label}</div>
                  {meta.hint && <div className="text-xs text-slate-400">{meta.hint}</div>}
                </div>
                <div className="sm:col-span-2">
                  <input
                    className="input"
                    value={values[s.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
