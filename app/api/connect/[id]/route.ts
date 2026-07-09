import { NextRequest, NextResponse } from 'next/server'
import { connectorConfigured } from '@/lib/connectors'
import { resolveConnector } from '@/lib/custom-connectors'
import { buildAuthUrl, signState, pkcePair } from '@/lib/oauth'
import { isAuthed } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Starts the OAuth flow: redirect the admin to the provider's consent screen.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
  const c = await resolveConnector(params.id)
  if (!c) return NextResponse.json({ error: 'Unknown connector' }, { status: 404 })
  if (!connectorConfigured(c)) {
    return NextResponse.redirect(new URL(`/admin/connectors?setup=${c.id}`, req.nextUrl.origin))
  }

  const redirectUri = `${req.nextUrl.origin}/api/connect/${c.id}/callback`
  const nonce = crypto.randomBytes(12).toString('hex')
  const pkce = c.pkce ? pkcePair() : null
  const state = signState({ c: c.id, n: nonce, v: pkce?.verifier })
  const url = buildAuthUrl(c, redirectUri, state, pkce?.challenge)

  const res = NextResponse.redirect(url)
  res.cookies.set('cms_oauth', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return res
}
