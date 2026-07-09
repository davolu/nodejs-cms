import { NextRequest, NextResponse } from 'next/server'
import { socialProvider, safeNext } from '@/lib/social'
import { verifyState, exchangeCode, pick } from '@/lib/oauth'
import { usersRepo } from '@/lib/store'
import { hashPassword, signSession, MEMBER_COOKIE, MEMBER_MAX_AGE } from '@/lib/members'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const c = socialProvider(params.provider)
  if (!c) return NextResponse.json({ error: 'Unknown provider' }, { status: 404 })
  const origin = req.nextUrl.origin
  const sp = req.nextUrl.searchParams
  const code = sp.get('code')
  const returnedState = sp.get('state') || ''
  const cookieState = req.cookies.get('cms_social')?.value
  if (!code || !returnedState || returnedState !== cookieState) {
    return NextResponse.redirect(new URL('/account?login_error=state', origin))
  }
  const state = verifyState(returnedState)
  if (!state || state.c !== `login-${params.provider}`) {
    return NextResponse.redirect(new URL('/account?login_error=state', origin))
  }
  const next = safeNext(state.v || null)

  try {
    const redirectUri = `${origin}/api/auth/social/${params.provider}/callback`
    const token = await exchangeCode(c, code, redirectUri)
    // Fetch the visitor's identity.
    const ui = await fetch(c.userInfoUrl!, { headers: { authorization: `Bearer ${token.access_token}`, 'user-agent': 'ContentHub', accept: 'application/json' } }).then((r) => r.json())
    let email = pick(ui, c.accountEmailPath)
    const name = pick(ui, c.accountNamePath) || ui.login || ''
    // GitHub may hide the email on /user — fall back to the emails endpoint.
    if (!email && params.provider === 'github') {
      const emails = await fetch('https://api.github.com/user/emails', { headers: { authorization: `Bearer ${token.access_token}`, 'user-agent': 'ContentHub', accept: 'application/json' } }).then((r) => r.json()).catch(() => [])
      if (Array.isArray(emails)) email = (emails.find((e: any) => e.primary && e.verified) || emails[0])?.email || ''
      if (!email && ui.login) email = `${ui.login}@users.noreply.github.com`
    }
    if (!email) return NextResponse.redirect(new URL(`${next}?login_error=no_email`, origin))

    // Find or create the member, then start a member session.
    let user = await usersRepo.findByEmail(email)
    if (!user) user = await usersRepo.create({ email, name, passwordHash: hashPassword(crypto.randomBytes(24).toString('hex')) })

    const res = NextResponse.redirect(new URL(next, origin))
    res.cookies.set(MEMBER_COOKIE, signSession(user.id), { httpOnly: true, secure: true, sameSite: 'lax', maxAge: MEMBER_MAX_AGE, path: '/' })
    res.cookies.set('cms_social', '', { maxAge: 0, path: '/' })
    return res
  } catch (e: any) {
    return NextResponse.redirect(new URL(`${next}?login_error=failed`, origin))
  }
}
