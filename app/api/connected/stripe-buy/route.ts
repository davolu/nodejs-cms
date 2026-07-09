import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Public: create a one-off Stripe Checkout session for a buy button. Demo-safe:
// falls back to a friendly error if Stripe isn't configured.
export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return NextResponse.json({ error: 'Payments are not configured.' }, { status: 400 })
  const b = await req.json().catch(() => ({}))
  const label = String(b.label || 'Purchase').slice(0, 120)
  const currency = String(b.currency || 'usd').toLowerCase().slice(0, 5)
  const amount = Math.max(50, Math.round(Number(b.amount) * 100) || 0) // cents, min 0.50
  const origin = req.nextUrl.origin

  const form = new URLSearchParams()
  form.set('mode', 'payment')
  form.set('success_url', `${origin}/shop/success`)
  form.set('cancel_url', `${origin}/`)
  form.set('line_items[0][quantity]', '1')
  form.set('line_items[0][price_data][currency]', currency)
  form.set('line_items[0][price_data][unit_amount]', String(amount))
  form.set('line_items[0][price_data][product_data][name]', label)

  try {
    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/x-www-form-urlencoded' }, body: form.toString(),
    })
    const data = await resp.json()
    if (!resp.ok) return NextResponse.json({ error: data?.error?.message || 'Stripe error.' }, { status: 502 })
    return NextResponse.json({ url: data.url })
  } catch {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 })
  }
}
