import { NextRequest, NextResponse } from 'next/server'
import { mailchimpSubscribe } from '@/lib/actions'

export const dynamic = 'force-dynamic'

// Public: a site visitor subscribes to the owner's Mailchimp audience.
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}))
  const email = String(b.email || '').trim()
  const listId = String(b.listId || '').trim()
  if (!email || !/@/.test(email) || !listId) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 })
  try {
    await mailchimpSubscribe({ listId, email, name: String(b.name || '').slice(0, 80) })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 502 })
  }
}
