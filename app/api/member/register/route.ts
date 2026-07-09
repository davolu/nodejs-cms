import { NextRequest, NextResponse } from 'next/server'
import { usersRepo } from '@/lib/store'
import { hashPassword, signSession, MEMBER_COOKIE, MEMBER_MAX_AGE } from '@/lib/members'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json().catch(() => ({}))
  if (!email || !password || String(password).length < 6) {
    return NextResponse.json({ error: 'Enter an email and a password of at least 6 characters.' }, { status: 400 })
  }
  const existing = await usersRepo.findByEmail(email)
  if (existing) return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 })

  const user = await usersRepo.create({ email, name: name || '', passwordHash: hashPassword(password) })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  res.cookies.set(MEMBER_COOKIE, signSession(user.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: MEMBER_MAX_AGE })
  return res
}
