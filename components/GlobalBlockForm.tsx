'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import type { Block } from '@/lib/blocks'
import type { GlobalBlock } from '@/lib/seed'
import VisualEditor from '@/components/VisualEditor'
import BlockEditor from '@/components/BlockEditor'

export default function GlobalBlockForm({ initial }: { initial?: GlobalBlock }) {
  const router = useRouter()
  const editing = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [blocks, setBlocks] = useState<Block[]>(initial?.blocks ?? [])
  const [mode, setMode] = useState<'visual' | 'form'>('visual')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!name.trim()) { setError('Give this block a name.'); return }
    setSaving(true); setError('')
    const url = editing ? `/api/blocks/${initial!.id}` : '/api/blocks'
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, blocks }) })
    setSaving(false)
    if (res.ok) router.push('/admin/blocks')
    else setError('Could not save. Please try again.')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/admin/blocks" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Blocks</Link>
        <button onClick={save} disabled={saving} className="btn-primary"><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save block'}</button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      <div className="card mb-4 p-5">
        <label className="label">Block name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Newsletter CTA, Promo banner" />
        <p className="field-hint">Used to pick this block from the Global Block widget. Not shown to visitors.</p>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Block content</h3>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
          <button onClick={() => setMode('visual')} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium ${mode === 'visual' ? 'bg-brand-600 text-white' : 'text-slate-500'}`}><LayoutGrid className="h-3.5 w-3.5" /> Visual</button>
          <button onClick={() => setMode('form')} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium ${mode === 'form' ? 'bg-brand-600 text-white' : 'text-slate-500'}`}><List className="h-3.5 w-3.5" /> Form</button>
        </div>
      </div>
      {mode === 'visual'
        ? <VisualEditor blocks={blocks} onChange={setBlocks} saving={saving} onSave={save} />
        : <BlockEditor blocks={blocks} onChange={setBlocks} />}
    </div>
  )
}
