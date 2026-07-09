import { NextRequest, NextResponse } from 'next/server'
import { ordersRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Verifies a Stripe session after redirect and marks the matching order paid.
export async function POST(req: NextRequest) {
  const { session_id } = await req.json().catch(() => ({}))
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || !session_id) return NextResponse.json({ ok: true })

  const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
    headers: { authorization: `Bearer ${stripeKey}` },
  })
  const s = await resp.json().catch(() => null)
  if (!resp.ok || !s) return NextResponse.json({ ok: false })

  if (s.payment_status === 'paid') {
    const orderId = s.metadata?.orderId
    const order = orderId ? null : await ordersRepo.findBySession(session_id)
    if (orderId) await ordersRepo.markPaid(orderId)
    else if (order) await ordersRepo.markPaid(order.id)
    return NextResponse.json({ ok: true, paid: true })
  }
  return NextResponse.json({ ok: true, paid: false })
}
