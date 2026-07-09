import { NextRequest, NextResponse } from 'next/server'
import { productsRepo, ordersRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { items, email } = await req.json().catch(() => ({}))
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
  }

  // Build line items from SERVER-SIDE product data — never trust client prices.
  const lineItems: { name: string; price: number; qty: number; productId: string }[] = []
  for (const it of items) {
    const p = await productsRepo.get(String(it.id))
    if (!p || !p.active) continue
    const qty = Math.max(1, Math.min(99, Math.round(Number(it.qty) || 1)))
    lineItems.push({ name: p.name, price: p.price, qty, productId: p.id })
  }
  if (lineItems.length === 0) return NextResponse.json({ error: 'No valid items in cart.' }, { status: 400 })

  const total = lineItems.reduce((s, l) => s + l.price * l.qty, 0)
  const currency = 'usd'
  const origin = req.nextUrl.origin
  const orderItems = lineItems.map((l) => ({ productId: l.productId, name: l.name, price: l.price, qty: l.qty }))

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    // Demo mode: record a paid order and skip real payment.
    const order = await ordersRepo.create({ email, items: orderItems, total, currency, status: 'paid' })
    return NextResponse.json({ url: `${origin}/shop/success?order=${order.id}&demo=1` })
  }

  // Create the order first (pending), then a Stripe Checkout Session.
  const order = await ordersRepo.create({ email, items: orderItems, total, currency, status: 'pending' })
  const form = new URLSearchParams()
  form.set('mode', 'payment')
  form.set('success_url', `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`)
  form.set('cancel_url', `${origin}/?canceled=1`)
  form.set('metadata[orderId]', order.id)
  if (email) form.set('customer_email', String(email))
  lineItems.forEach((l, i) => {
    form.set(`line_items[${i}][price_data][currency]`, currency)
    form.set(`line_items[${i}][price_data][product_data][name]`, l.name)
    form.set(`line_items[${i}][price_data][unit_amount]`, String(l.price))
    form.set(`line_items[${i}][quantity]`, String(l.qty))
  })

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${stripeKey}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  const data = await resp.json()
  if (!resp.ok) {
    return NextResponse.json({ error: data?.error?.message || 'Stripe error' }, { status: 502 })
  }
  return NextResponse.json({ url: data.url })
}
