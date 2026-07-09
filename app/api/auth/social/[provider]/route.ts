import { NextRequest, NextResponse } from 'next/server'
import { socialProvider, socialConfigured, safeNext } from '@/lib/social'
import { buildAuthUrl, signState } from '@/lib/oauth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Starts visitor sign-in with a social provider.
export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const c = socialProvider(params.provider)
  if (!c) return NextResponse.json({ error: 'Unknown provider' }, { status: 404 })
  const next = safeNext(req.nextUrl.searchParams.get('next'))
  if (!socialConfigured(params.provider)) {
    return NextResponse.redirect(new URL(`${next}?login_error=not_configured`, req.nextUrl.origin))
  }
  const redirectUri = `${req.nextUrl.origin}/api/auth/social/${params.provider}/callback`
  const nonce = crypto.randomBytes(12).toString('hex')
  const state = signState({ c: `login-${params.provider}`, n: nonce, v: next })
  const url = buildAuthUrl(c, redirectUri, state)
  const res = NextResponse.redirect(url)
  res.cookies.set('cms_social', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return res
}
