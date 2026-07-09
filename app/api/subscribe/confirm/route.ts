import { NextRequest, NextResponse } from 'next/server'
import { usersRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Verifies a Stripe subscription session after redirect and activates the member.
export async function POST(req: NextRequest) {
  const { session_id } = await req.json().catch(() => ({}))
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || !session_id) return NextResponse.json({ ok: true })

  const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
    headers: { authorization: `Bearer ${stripeKey}` },
  })
  const s = await resp.json().catch(() => null)
  if (!resp.ok || !s) return NextResponse.json({ ok: false })

  const paid = s.status === 'complete' || s.payment_status === 'paid'
  if (paid && s.metadata?.memberId) {
    await usersRepo.setSubscription(s.metadata.memberId, {
      subscribed: true, plan: s.metadata.planId || '', stripeCustomerId: typeof s.customer === 'string' ? s.customer : '',
    })
    return NextResponse.json({ ok: true, subscribed: true })
  }
  return NextResponse.json({ ok: true, subscribed: false })
}
