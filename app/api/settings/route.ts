import { NextRequest, NextResponse } from 'next/server'
import { settingsRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await settingsRepo.list())
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() // { entries: [{key,value}] }
    const entries = Array.isArray(body?.entries) ? body.entries : []
    return NextResponse.json(await settingsRepo.upsertMany(entries))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
