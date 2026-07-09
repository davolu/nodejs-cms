'use client'

import { useState } from 'react'
import { ShoppingCart, X, Plus, Minus, Trash2, Loader2 } from 'lucide-react'
import { useCart, formatMoney } from './CartProvider'

export default function CartButton() {
  const cart = useCart()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function checkout() {
    setBusy(true); setError('')
    const res = await fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.items.map((i) => ({ id: i.id, qty: i.qty })) }),
    }).catch(() => null)
    const d = res ? await res.json().catch(() => ({})) : {}
    if (res && res.ok && d.url) { window.location.href = d.url; return }
    setError(d.error || 'Checkout failed. Please try again.')
    setBusy(false)
  }

  return (
    <>
      {cart.count > 0 && (
        <button
          onClick={() => cart.setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl transition-transform hover:-translate-y-0.5"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{cart.count}</span>
        </button>
      )}

      {cart.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => cart.setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="site-heading text-lg font-bold text-slate-900">Your cart</h2>
              <button onClick={() => cart.setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            {cart.items.length === 0 ? (
              <div className="grid flex-1 place-items-center text-sm text-slate-400">Your cart is empty.</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5">
                  <ul className="space-y-4">
                    {cart.items.map((it) => (
                      <li key={it.id} className="flex gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.image} alt={it.name} className="h-16 w-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <div className="flex justify-between gap-2">
                            <span className="text-sm font-medium text-slate-800">{it.name}</span>
                            <button onClick={() => cart.remove(it.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-lg border border-slate-200">
                              <button onClick={() => cart.setQty(it.id, it.qty - 1)} className="p-1.5 text-slate-500 hover:bg-slate-50"><Minus className="h-3.5 w-3.5" /></button>
                              <span className="w-6 text-center text-sm tabular-nums">{it.qty}</span>
                              <button onClick={() => cart.setQty(it.id, it.qty + 1)} className="p-1.5 text-slate-500 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{formatMoney(it.price * it.qty)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-100 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Subtotal</span>
                    <span className="site-heading text-xl font-bold text-slate-900">{formatMoney(cart.total)}</span>
                  </div>
                  {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
                  <button onClick={checkout} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    {busy ? 'Redirecting…' : 'Checkout'}
                  </button>
                  <p className="mt-2 text-center text-xs text-slate-400">Secure checkout via Stripe</p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
