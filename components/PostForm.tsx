'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, ImagePlus, Eye, Sparkles, Loader2, Wand2 } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/lib/seed'
import MediaInput from '@/components/media/MediaInput'

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

type Props = { initial?: Post }

export default function PostForm({ initial }: Props) {
  const router = useRouter()
  const editing = !!initial
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(editing)
  const [aiBusy, setAiBusy] = useState<string>('')
  const [aiError, setAiError] = useState('')
  const [titleIdeas, setTitleIdeas] = useState<string[]>([])
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    excerpt: initial?.excerpt ?? '',
    body: initial?.body ?? '',
    featuredImage: initial?.featuredImage ?? '',
    metaTitle: initial?.metaTitle ?? '',
    metaDescription: initial?.metaDescription ?? '',
    status: initial?.status ?? 'draft',
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function ai(action: string) {
    setAiBusy(action); setAiError('')
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text: form.body, title: form.title }),
      })
      const d = await res.json()
      if (!res.ok) { setAiError(d.error || 'AI request failed.'); return }
      if (action === 'seo') { setForm((f) => ({ ...f, metaTitle: d.metaTitle || f.metaTitle, metaDescription: d.metaDescription || f.metaDescription })) }
      else if (action === 'titles') { setTitleIdeas(Array.isArray(d.titles) ? d.titles : []) }
      else if (action === 'excerpt') { set('excerpt', d.result || '') }
      else { set('body', d.result || form.body) } // draft/improve/shorten/expand
    } catch { setAiError('AI request failed.') }
    finally { setAiBusy('') }
  }


  function onTitle(v: string) {
    set('title', v)
    if (!slugTouched) set('slug', slugify(v))
  }

  async function persist(status?: 'draft' | 'published'): Promise<Post | null> {
    setError('')
    const payload = { ...form, status: status ?? form.status }
    const res = await fetch(editing ? `/api/posts/${initial!.id}` : '/api/posts', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || `Save failed (${res.status}). Please try again.`)
      return null
    }
    return (await res.json()) as Post
  }

  async function save(status?: 'draft' | 'published') {
    setSaving(true)
    const saved = await persist(status)
    setSaving(false)
    if (saved) router.push('/admin/posts')
  }

  async function preview() {
    setSaving(true)
    const saved = await persist()
    setSaving(false)
    if (saved) window.open(`/blog/${saved.slug}?preview=1`, '_blank')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts" className="btn-ghost !px-2"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {editing ? 'Edit post' : 'New post'}
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
            <div className="flex items-center justify-between">
              <label className="label">Title</label>
              <AiBtn label="Suggest titles" action="titles" busy={aiBusy} onClick={() => ai('titles')} />
            </div>
            <input className="input" value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="e.g. Introducing ContentHub" />
            {titleIdeas.length > 0 && (
              <div className="mt-2 space-y-1 rounded-lg bg-brand-50/60 p-2">
                {titleIdeas.map((t, i) => (
                  <button key={i} onClick={() => { onTitle(t); setTitleIdeas([]) }} className="block w-full rounded px-2 py-1 text-left text-sm text-slate-700 hover:bg-white">{t}</button>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <label className="label">Excerpt</label>
              <AiBtn label="Generate" action="excerpt" busy={aiBusy} onClick={() => ai('excerpt')} />
            </div>
            <textarea className="input min-h-[70px]" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="A one or two sentence summary shown in listings." />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <label className="label !mb-0">Content</label>
              <div className="flex flex-wrap gap-1.5">
                <AiBtn label="Write draft" action="draft" busy={aiBusy} onClick={() => ai('draft')} primary />
                <AiBtn label="Improve" action="improve" busy={aiBusy} onClick={() => ai('improve')} />
                <AiBtn label="Shorten" action="shorten" busy={aiBusy} onClick={() => ai('shorten')} />
                <AiBtn label="Expand" action="expand" busy={aiBusy} onClick={() => ai('expand')} />
              </div>
            </div>
            <textarea
              className="input mt-1 min-h-[220px] font-mono text-[13px] leading-relaxed"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder="Write your post here… or let AI draft it from the title."
            />
            {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">SEO</h3>
              <AiBtn label="Generate SEO" action="seo" busy={aiBusy} onClick={() => ai('seo')} />
            </div>
            <label className="label">Meta title</label>
            <input className="input" value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} />
            <label className="label mt-4">Meta description</label>
            <textarea className="input min-h-[80px]" value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
            <p className="field-hint">{form.metaDescription.length}/160 characters</p>
          </div>
        </div>

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
                placeholder="post-slug"
              />
            </div>
          </div>

          <div className="card p-5">
            <label className="label">Featured image</label>
            {form.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.featuredImage} alt="" className="mb-3 h-32 w-full rounded-lg object-cover" />
            ) : (
              <div className="mb-3 grid h-32 place-items-center rounded-lg border border-dashed border-slate-300 text-slate-400">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
            <MediaInput value={form.featuredImage} onChange={(v) => set('featuredImage', v)} />
            <p className="field-hint">Paste an image URL, upload, or pick from the Media library.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AiBtn({ label, action, busy, onClick, primary }: { label: string; action: string; busy: string; onClick: () => void; primary?: boolean }) {
  const isBusy = busy === action
  const anyBusy = busy !== ''
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={anyBusy}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${primary ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
    >
      {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : primary ? <Wand2 className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {label}
    </button>
  )
}
