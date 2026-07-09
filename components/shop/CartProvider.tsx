'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface CartItem { id: string; name: string; price: number; image: string; qty: number }
interface CartApi {
  items: CartItem[]
  count: number
  total: number
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  open: boolean
  setOpen: (v: boolean) => void
}

const noop: CartApi = {
  items: [], count: 0, total: 0, add: () => {}, setQty: () => {}, remove: () => {}, clear: () => {}, open: false, setOpen: () => {},
}
const CartContext = createContext<CartApi | null>(null)
export function useCart(): CartApi { return useContext(CartContext) ?? noop }

export function formatMoney(cents: number, currency = 'usd'): string {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format((cents || 0) / 100) }
  catch { return `$${((cents || 0) / 100).toFixed(2)}` }
}

const KEY = 'cms_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)) } catch {}
    setReady(true)
  }, [])
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {} } }, [items, ready])

  const add = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((cur) => {
      const i = cur.findIndex((x) => x.id === item.id)
      if (i >= 0) { const next = [...cur]; next[i] = { ...next[i], qty: next[i].qty + qty }; return next }
      return [...cur, { ...item, qty }]
    })
    setOpen(true)
  }, [])
  const setQty = useCallback((id: string, qty: number) => {
    setItems((cur) => qty <= 0 ? cur.filter((x) => x.id !== id) : cur.map((x) => (x.id === id ? { ...x, qty } : x)))
  }, [])
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((x) => x.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((s, x) => s + x.qty, 0)
  const total = items.reduce((s, x) => s + x.price * x.qty, 0)

  return (
    <CartContext.Provider value={{ items, count, total, add, setQty, remove, clear, open, setOpen }}>
      {children}
    </CartContext.Provider>
  )
}
