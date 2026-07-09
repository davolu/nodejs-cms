import { NextResponse } from 'next/server'
import { getPlans } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getPlans())
}
