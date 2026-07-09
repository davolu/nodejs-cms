'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Eye, Sparkles, Loader2, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import type { Page } from '@/lib/seed'
import type { Block } from '@/lib/blocks'
import { THEMES, THEME_NAMES } from '@/lib/blocks'
import BlockEditor from '@/components/BlockEditor'
import VisualEditor from '@/components/VisualEditor'

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

type Props = { initial?: Page }

export default function PageForm({ initial }: Props) {
  const router = useRouter()
  const editing = !!initial
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(editing)
  const [blocks, setBlocks] = useState<Block[]>(initial?.blocks ?? [])
  const [theme, setTheme] = useState<string>(initial?.theme ?? 'indigo')
  const [access, setAccess] = useState<'public' | 'members'>(initial?.access ?? 'public')
  const [mode, setMode] = useState<'visual' | 'form'>('visual')
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    template: initial?.template ?? 'default',
    metaTitle: initial?.metaTitle ?? '',
    metaDescription: initial?.metaDescription ?? '',
    status: initial?.status ?? 'draft',
  })

  // AI generation state
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  function onTitle(v: string) {
    set('title', v)
    if (!slugTouched) set('slug', slugify(v))
  }

  async function generate() {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAiError(data.error || 'Generation failed.')
        return
      }
      setBlocks(data.blocks)
      if (data.theme && THEME_NAMES.includes(data.theme)) setTheme(data.theme)
      setForm((f) => ({
        ...f,
        title: f.title || data.title || '',
        slug: !slugTouched && !f.slug ? slugify(data.title || f.title || '') : f.slug,
        metaTitle: f.metaTitle || data.metaTitle || '',
        metaDescription: f.metaDescription || data.metaDescription || '',
      }))
      setAiOpen(false)
      setAiPrompt('')
    } catch (e: any) {
      setAiError('Could not reach the AI service.')
    } finally {
      setAiLoading(false)
    }
  }

  async function persist(status?: 'draft' | 'published'): Promise<Page | null> {
    setError('')
    const payload = { ...form, blocks, theme, access, status: status ?? form.status }
    const res = await fetch(editing ? `/api/pages/${initial!.id}` : '/api/pages', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || `Save failed (${res.status}). Please try again.`)
      return null
    }
    return (await res.json()) as Page
  }

  async function save(status?: 'draft' | 'published') {
    setSaving(true)
    const saved = await persist(status)
    setSaving(false)
    if (saved) router.push('/admin/pages')
  }

  async function preview() {
    setSaving(true)
    const saved = await persist()
    setSaving(false)
    if (saved) window.open(`/${saved.slug}?preview=1`, '_blank')
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="btn-ghost !px-2"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {editing ? 'Edit page' : 'New page'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={preview} disabled={saving} className="btn-outline"><Eye className="h-4 w-4" /> Preview</button>
          <button onClick={() => save('draft')} disabled={saving} className="btn-outline">Save draft</button>
          <button onClick={() => save('published')} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="e.g. About Us" />
          </div>

          {/* AI generate */}
          <div className="card border-brand-200 bg-brand-50/40 p-4">
            {!aiOpen ? (
              <button onClick={() => setAiOpen(true)} className="btn-outline w-full border-brand-200 text-brand-700 hover:bg-brand-50">
                <Sparkles className="h-4 w-4" /> Generate this page with AI
              </button>
            ) : (
              <div>
                <label className="label flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" /> Describe the page</label>
                <textarea
                  className="input min-h-[70px]"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. A landing page for a dog-walking service in Lagos, with a hero, benefits, and a booking call-to-action."
                />
                {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}
                <div className="mt-2 flex gap-2">
                  <button onClick={generate} disabled={aiLoading} className="btn-primary">
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {aiLoading ? 'Generating…' : 'Generate'}
                  </button>
                  <button onClick={() => { setAiOpen(false); setAiError('') }} disabled={aiLoading} className="btn-ghost">Cancel</button>
                </div>
                <p className="field-hint">Generated blocks replace the current content. You can then edit and reorder them.</p>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Page content</h3>
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
                  <button
                    onClick={() => setMode('visual')}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${mode === 'visual' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" /> Visual
                  </button>
                  <button
                    onClick={() => setMode('form')}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${mode === 'form' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <List className="h-3.5 w-3.5" /> Form
                  </button>
                </div>
                <span className="hidden text-xs text-slate-400 sm:inline">
                  {mode === 'visual' ? 'Click to edit, drag to reorder' : 'Drag the handle to reorder'}
                </span>
              </div>
            </div>
            {mode === 'visual' ? (
              <VisualEditor
                blocks={blocks}
                onChange={setBlocks}
                theme={theme}
                saving={saving}
                onPreview={preview}
                onSave={async () => { setSaving(true); await persist(form.status); setSaving(false) }}
              />
            ) : (
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            )}
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

        <div className="space-y-4">
          <div className="card p-5">
            <label className="label">Theme</label>
            <p className="mb-3 text-xs text-slate-400">Sets the color palette for this page.</p>
            <div className="grid grid-cols-4 gap-2">
              {THEME_NAMES.map((name) => {
                const t = THEMES[name]
                const active = theme === name
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setTheme(name)}
                    title={name}
                    className={`group relative h-9 rounded-lg ring-offset-2 transition ${active ? 'ring-2 ring-slate-900' : 'ring-1 ring-slate-200 hover:ring-slate-300'}`}
                    style={{ backgroundImage: `linear-gradient(120deg, ${t.from}, ${t.to})` }}
                  >
                    <span className="sr-only">{name}</span>
                  </button>
                )
              })}
            </div>
            <p className="field-hint capitalize">Selected: {theme}</p>
          </div>

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
            <p className="field-hint">This is the page&apos;s address on your live site.</p>

            <label className="label mt-4">Access</label>
            <select className="input" value={access} onChange={(e) => setAccess(e.target.value as 'public' | 'members')}>
              <option value="public">Public — anyone can view</option>
              <option value="members">Members only — sign-in required</option>
            </select>
            {access === 'members' && <p className="field-hint">Visitors must log in via a Login / Signup widget to see this page.</p>}

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
