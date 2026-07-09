'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Database, X, ChevronUp, ChevronDown } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui'

interface Field { key: string; label: string; type: string }
interface Collection { id: string; name: string; slug: string; fields: Field[]; ownership?: 'shared' | 'own' }
const FIELD_TYPES = ['text', 'textarea', 'image', 'url', 'number', 'date', 'boolean']
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

export default function CollectionsPage() {
  const [items, setItems] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [name, setName] = useState('')
  const [ownership, setOwnership] = useState<'shared' | 'own'>('shared')
  const [fields, setFields] = useState<Field[]>([])

  async function load() { const r = await fetch('/api/collections', { cache: 'no-store' }); setItems(r.ok ? await r.json() : []); setLoading(false) }
  useEffect(() => { load() }, [])

  function startNew() { setEditing(null); setName(''); setOwnership('shared'); setFields([{ key: 'summary', label: 'Summary', type: 'textarea' }]); setOpen(true) }
  function startEdit(c: Collection) { setEditing(c); setName(c.name); setOwnership(c.ownership || 'shared'); setFields(c.fields); setOpen(true) }

  async function save() {
    const payload = { name, ownership, fields: fields.filter((f) => f.label).map((f) => ({ ...f, key: f.key || slugify(f.label) })) }
    if (editing) await fetch(`/api/collections/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    else await fetch('/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setOpen(false); load()
  }
  async function remove(id: string) { if (!confirm('Delete this collection and all its entries?')) return; await fetch(`/api/collections/${id}`, { method: 'DELETE' }); setItems((x) => x.filter((c) => c.id !== id)) }

  const setField = (i: number, patch: Partial<Field>) => setFields(fields.map((f, j) => (j === i ? { ...f, ...patch } : f)))
  const moveField = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= fields.length) return; const n = [...fields];[n[i], n[j]] = [n[j], n[i]]; setFields(n) }

  return (
    <div>
      <PageHeader title="Collections" subtitle="Define custom content types (Projects, Events, Team…) with your own fields."
        action={<button onClick={startNew} className="btn-primary shrink-0"><Plus className="h-4 w-4" /> New collection</button>} />

      {loading ? <div className="card p-10 text-center text-sm text-slate-400">Loading…</div>
        : items.length === 0 ? <EmptyState title="No collections yet" hint="Create a content type, add entries, then show them with the Collection widget." />
        : (
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c.id} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><Database className="h-4 w-4" /></span>
                  <div>
                    <div className="font-medium text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-400">/{c.slug} · {c.fields.length} field{c.fields.length === 1 ? '' : 's'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/collections/${c.id}`} className="btn-primary !py-1.5 text-xs">Manage entries</Link>
                  <button onClick={() => startEdit(c)} className="btn-outline !py-1.5 text-xs"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(c.id)} className="btn-danger !px-2 !py-1.5"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit collection' : 'New collection'}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Projects" />
            <label className="label mt-3">Who owns entries</label>
            <select className="input" value={ownership} onChange={(e) => setOwnership(e.target.value as 'shared' | 'own')}>
              <option value="shared">Shared — everyone sees all entries</option>
              <option value="own">Per-member — each member sees only their own (managers/admins see all)</option>
            </select>

            <div className="mt-4 mb-1 text-sm font-semibold text-slate-900">Fields</div>
            <p className="mb-2 text-xs text-slate-400">Every entry also has a Title and Slug automatically.</p>
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input" value={f.label} onChange={(e) => setField(i, { label: e.target.value, key: slugify(e.target.value) })} placeholder="Field label" />
                  <select className="input !w-32" value={f.type} onChange={(e) => setField(i, { type: e.target.value })}>
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="flex shrink-0">
                    <button onClick={() => moveField(i, -1)} disabled={i === 0} className="btn-ghost !px-1.5 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                    <button onClick={() => moveField(i, 1)} disabled={i === fields.length - 1} className="btn-ghost !px-1.5 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                    <button onClick={() => setFields(fields.filter((_, j) => j !== i))} className="btn-danger !px-2"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => setFields([...fields, { key: '', label: '', type: 'text' }])} className="btn-outline !py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Add field</button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={save} className="btn-primary">Save collection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
