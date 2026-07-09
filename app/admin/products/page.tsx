'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus, Pencil, X } from 'lucide-react'
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui'

interface Product { id: string; name: string; slug: string; description: string; price: number; currency: string; image: string; active: boolean }
const money = (c: number) => `$${((c || 0) / 100).toFixed(2)}`
const blank = { name: '', description: '', price: '', image: '', active: true }

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<any>(blank)
  const [open, setOpen] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/products?all=1', { cache: 'no-store' })
    setItems(res.ok ? await res.json() : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function startNew() { setEditing(null); setForm(blank); setOpen(true) }
  function startEdit(p: Product) { setEditing(p); setForm({ name: p.name, description: p.description, price: (p.price / 100).toString(), image: p.image, active: p.active }); setOpen(true) }

  async function save() {
    const payload = { name: form.name, description: form.description, price: Math.round(parseFloat(form.price || '0') * 100), image: form.image, active: form.active }
    if (editing) await fetch(`/api/products/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    else await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setOpen(false); load()
  }
  async function remove(id: string) {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' }); setItems((x) => x.filter((p) => p.id !== id))
  }
  async function toggle(p: Product) {
    await fetch(`/api/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !p.active }) })
    setItems((x) => x.map((i) => (i.id === p.id ? { ...i, active: !i.active } : i)))
  }

  return (
    <div>
      <PageHeader title="Products" subtitle="Items sold through your Product Grid widget." action={<button onClick={startNew} className="btn-primary"><Plus className="h-4 w-4" /> New product</button>} />

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading products…</div>
      ) : items.length === 0 ? (
        <EmptyState title="No products yet" hint="Add your first product, then drop a Product Grid widget on a page." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="aspect-video w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    <div className="text-sm text-slate-500">{money(p.price)}</div>
                  </div>
                  <StatusBadge status={p.active ? 'published' : 'draft'} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => startEdit(p)} className="btn-outline !py-1.5 text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => toggle(p)} className="btn-outline !py-1.5 text-xs">{p.active ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => remove(p.id)} className="btn-danger !px-2 !py-1.5 ml-auto"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit product' : 'New product'}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Description</label><textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Price (USD)</label><input type="number" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="19.99" /></div>
                <div className="flex items-end"><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label></div>
              </div>
              <div><label className="label">Image URL</label><input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={save} className="btn-primary">Save product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
