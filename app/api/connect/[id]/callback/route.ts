import { NextRequest, NextResponse } from 'next/server'
import { getConnector } from '@/lib/connectors'
import { verifyState, exchangeCode, pick } from '@/lib/oauth'
import { connectionsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
  const c = getConnector(params.id)
  if (!c) return NextResponse.json({ error: 'Unknown connector' }, { status: 404 })

  const sp = req.nextUrl.searchParams
  const err = sp.get('error')
  if (err) return NextResponse.redirect(new URL(`/admin/connectors?error=${encodeURIComponent(err)}`, req.nextUrl.origin))

  const code = sp.get('code')
  const returnedState = sp.get('state') || ''
  const cookieState = req.cookies.get('cms_oauth')?.value
  // Verify state matches the signed cookie (CSRF protection).
  if (!code || !returnedState || returnedState !== cookieState) {
    return NextResponse.redirect(new URL('/admin/connectors?error=state_mismatch', req.nextUrl.origin))
  }
  const state = verifyState(returnedState)
  if (!state || state.c !== c.id) {
    return NextResponse.redirect(new URL('/admin/connectors?error=invalid_state', req.nextUrl.origin))
  }

  const redirectUri = `${req.nextUrl.origin}/api/connect/${c.id}/callback`
  try {
    const token = await exchangeCode(c, code, redirectUri, state.v)
    // Best-effort: fetch the connected account's identity for display.
    let account: Record<string, any> = {}
    if (c.userInfoUrl && token.access_token) {
      try {
        const ui = await fetch(c.userInfoUrl, { headers: { authorization: `Bearer ${token.access_token}`, 'user-agent': 'ContentHub' } })
        if (ui.ok) { const j = await ui.json(); account = { email: pick(j, c.accountEmailPath), name: pick(j, c.accountNamePath) } }
      } catch {}
    }
    await connectionsRepo.upsert({
      connector: c.id,
      accessToken: token.access_token || '',
      refreshToken: token.refresh_token || '',
      expiresAt: token.expires_in ? Date.now() + token.expires_in * 1000 : 0,
      scope: token.scope || c.scopes.join(' '),
      account,
      updatedAt: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.redirect(new URL(`/admin/connectors?error=${encodeURIComponent((e?.message || 'exchange_failed').slice(0, 80))}`, req.nextUrl.origin))
  }

  const res = NextResponse.redirect(new URL(`/admin/connectors?connected=${c.id}`, req.nextUrl.origin))
  res.cookies.set('cms_oauth', '', { maxAge: 0, path: '/' })
  return res
}
