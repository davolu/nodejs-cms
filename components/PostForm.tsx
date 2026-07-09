'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, ImagePlus, Eye } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/lib/seed'

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

type Props = { initial?: Post }

export default function PostForm({ initial }: Props) {
  const router = useRouter()
  const editing = !!initial
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(editing)
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
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="e.g. Introducing ContentHub" />

            <label className="label mt-4">Excerpt</label>
            <textarea className="input min-h-[70px]" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="A one or two sentence summary shown in listings." />

            <label className="label mt-4">Content</label>
            <textarea
              className="input min-h-[220px] font-mono text-[13px] leading-relaxed"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder="Write your post here…"
            />
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">SEO</h3>
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
            <input className="input" value={form.featuredImage} onChange={(e) => set('featuredImage', e.target.value)} placeholder="https://…/image.jpg" />
            <p className="field-hint">Paste an image URL, or pick one from the Media library.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
