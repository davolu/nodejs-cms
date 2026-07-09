import { NextResponse } from 'next/server'
import { SOCIAL, socialConfigured } from '@/lib/social'

export const dynamic = 'force-dynamic'

// Public: which social sign-in providers are configured (client creds present).
export async function GET() {
  const providers = Object.keys(SOCIAL).map((id) => ({ id, name: SOCIAL[id].name, brand: SOCIAL[id].brand, configured: socialConfigured(id) }))
  return NextResponse.json({ providers })
}
