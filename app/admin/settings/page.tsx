'use client'

import { useEffect, useState } from 'react'
import { Save, Home } from 'lucide-react'
import type { Setting, Page } from '@/lib/seed'
import { PageHeader } from '@/components/ui'

const LABELS: Record<string, { label: string; hint: string }> = {
  site_title: { label: 'Site title', hint: 'Appears in the browser tab and search results.' },
  site_description: { label: 'Site description', hint: 'Default meta description for the site.' },
  site_url: { label: 'Site URL', hint: 'The public address of your website.' },
  posts_per_page: { label: 'Posts per page', hint: 'How many posts show on listing pages.' },
}
const HIDDEN = new Set(['home_page_id']) // rendered with its own control

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/pages', { cache: 'no-store' }).then((r) => r.json()),
    ]).then(([s, p]: [Setting[], Page[]]) => {
      setSettings(s)
      setPages(p)
      const map = Object.fromEntries(s.map((x) => [x.key, x.value]))
      if (!('home_page_id' in map)) map.home_page_id = ''
      setValues(map)
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

  const publishedPages = pages.filter((p) => p.status === 'published')
  const generalSettings = settings.filter((s) => !HIDDEN.has(s.key))

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
        <div className="max-w-2xl space-y-4">
          {/* Home page selector */}
          <div className="card p-5">
            <div className="mb-2 flex items-center gap-2">
              <Home className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-900">Home page</h3>
            </div>
            <p className="mb-3 text-xs text-slate-500">Choose which published page visitors see at your site root (/).</p>
            <select
              className="input"
              value={values.home_page_id ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, home_page_id: e.target.value }))}
            >
              <option value="">— Default (page with slug “home”) —</option>
              {publishedPages.map((p) => (
                <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>
              ))}
            </select>
            {publishedPages.length === 0 && (
              <p className="field-hint">Publish a page first to set it as your home page.</p>
            )}
          </div>

          {/* General settings */}
          <div className="card divide-y divide-slate-100">
            {generalSettings.map((s) => {
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
        </div>
      )}
    </div>
  )
}
