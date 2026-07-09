'use client'

import { useEffect, useState } from 'react'
import { StatusBadge, PageHeader, EmptyState, fmtDate } from '@/components/ui'

interface OrderItem { name: string; price: number; qty: number }
interface Order { id: string; email: string; items: OrderItem[]; total: number; currency: string; status: string; createdAt: string }
const money = (c: number) => `$${((c || 0) / 100).toFixed(2)}`

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { const res = await fetch('/api/orders', { cache: 'no-store' }); setItems(res.ok ? await res.json() : []); setLoading(false) })() }, [])

  return (
    <div>
      <PageHeader title="Orders" subtitle="Purchases placed through checkout." />
      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading orders…</div>
      ) : items.length === 0 ? (
        <EmptyState title="No orders yet" hint="Orders appear here after a visitor checks out from a Product Grid widget." />
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="site-heading font-bold text-slate-900">{money(o.total)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{o.status}</span>
                  </div>
                  <div className="text-xs text-slate-400">{fmtDate(o.createdAt)}{o.email && <> · {o.email}</>}</div>
                </div>
              </div>
              <ul className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between"><span>{it.qty} × {it.name}</span><span>{money(it.price * it.qty)}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
