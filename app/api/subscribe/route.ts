import { NextRequest, NextResponse } from 'next/server'
import { getMemberId } from '@/lib/members'
import { getPlan } from '@/lib/plans'
import { usersRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const memberId = getMemberId()
  if (!memberId) return NextResponse.json({ error: 'Please sign in to subscribe.' }, { status: 401 })

  const { planId } = await req.json().catch(() => ({}))
  const plan = await getPlan(String(planId || ''))
  if (!plan) return NextResponse.json({ error: 'Unknown plan.' }, { status: 400 })

  const member = await usersRepo.findById(memberId)
  const origin = req.nextUrl.origin
  const stripeKey = process.env.STRIPE_SECRET_KEY

  if (!stripeKey) {
    // Demo mode: activate the subscription immediately, no real payment.
    await usersRepo.setSubscription(memberId, { subscribed: true, plan: plan.id })
    return NextResponse.json({ url: `${origin}/account?sub=demo` })
  }

  const form = new URLSearchParams()
  form.set('mode', 'subscription')
  form.set('success_url', `${origin}/account?sub=success&session_id={CHECKOUT_SESSION_ID}`)
  form.set('cancel_url', `${origin}/account?sub=cancel`)
  if (member?.email) form.set('customer_email', member.email)
  form.set('metadata[memberId]', memberId)
  form.set('metadata[planId]', plan.id)
  form.set('line_items[0][quantity]', '1')
  form.set('line_items[0][price_data][currency]', 'usd')
  form.set('line_items[0][price_data][product_data][name]', plan.name)
  form.set('line_items[0][price_data][unit_amount]', String(plan.priceCents))
  form.set('line_items[0][price_data][recurring][interval]', plan.interval)

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${stripeKey}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  const data = await resp.json()
  if (!resp.ok) return NextResponse.json({ error: data?.error?.message || 'Stripe error' }, { status: 502 })
  return NextResponse.json({ url: data.url })
}
