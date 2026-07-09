import { NextRequest, NextResponse } from 'next/server'
import { usersRepo } from '@/lib/store'
import { verifyPassword, signSession, MEMBER_COOKIE, MEMBER_MAX_AGE } from '@/lib/members'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}))
  const user = await usersRepo.findByEmail(email || '')
  if (!user || !verifyPassword(password || '', user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  res.cookies.set(MEMBER_COOKIE, signSession(user.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: MEMBER_MAX_AGE })
  return res
}
