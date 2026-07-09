import { NextResponse } from 'next/server'
import { getMemberId } from '@/lib/members'
import { usersRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const id = getMemberId()
  if (!id) return NextResponse.json({ user: null })
  const user = await usersRepo.findById(id)
  return NextResponse.json({ user: user ? { id: user.id, email: user.email, name: user.name } : null })
}
