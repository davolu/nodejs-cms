import { NextRequest, NextResponse } from 'next/server'
import { mediaRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await mediaRepo.list())
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    return NextResponse.json(await mediaRepo.create(body), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
