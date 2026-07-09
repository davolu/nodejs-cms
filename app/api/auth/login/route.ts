import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, SESSION_COOKIE, SESSION_VALUE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}))
  if (!checkCredentials(email ?? '', password ?? '')) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return res
}
