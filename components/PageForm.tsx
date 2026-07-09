'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Page } from '@/lib/seed'

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

type Props = { initial?: Page }

export default function PageForm({ initial }: Props) {
  const router = useRouter()
  const editing = !!initial
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(editing)
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    body: initial?.body ?? '',
    template: initial?.template ?? 'default',
    metaTitle: initial?.metaTitle ?? '',
    metaDescription: initial?.metaDescription ?? '',
    status: initial?.status ?? 'draft',
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  function onTitle(v: string) {
    set('title', v)
    if (!slugTouched) set('slug', slugify(v))
  }

  async function save(status?: 'draft' | 'published') {
    setSaving(true)
    const payload = { ...form, status: status ?? form.status }
    const res = await fetch(editing ? `/api/pages/${initial!.id}` : '/api/pages', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) router.push('/pages')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/pages" className="btn-ghost !px-2"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {editing ? 'Edit page' : 'New page'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save('draft')} disabled={saving} className="btn-outline">Save draft</button>
          <button onClick={() => save('published')} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="e.g. About Us" />

            <label className="label mt-4">Content</label>
            <textarea
              className="input min-h-[240px] font-mono text-[13px] leading-relaxed"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder="Write the page content here…"
            />
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">SEO</h3>
            <label className="label">Meta title</label>
            <input className="input" value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} placeholder="Shown in search results & browser tab" />
            <label className="label mt-4">Meta description</label>
            <textarea className="input min-h-[80px]" value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} placeholder="A short summary for search engines" />
            <p className="field-hint">{form.metaDescription.length}/160 characters</p>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <div className="card p-5">
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <label className="label mt-4">URL slug</label>
            <div className="flex items-center rounded-lg border border-slate-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <span className="px-2.5 text-sm text-slate-400">/</span>
              <input
                className="w-full rounded-r-lg px-1 py-2 text-sm text-slate-900 focus:outline-none"
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)) }}
                placeholder="about-us"
              />
            </div>
            <p className="field-hint">Auto-generated from the title. Edit to override.</p>

            <label className="label mt-4">Template</label>
            <select className="input" value={form.template} onChange={(e) => set('template', e.target.value)}>
              <option value="default">Default</option>
              <option value="landing">Landing</option>
              <option value="contact">Contact</option>
              <option value="full-width">Full width</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
