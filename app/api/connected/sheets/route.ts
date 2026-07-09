import { NextRequest, NextResponse } from 'next/server'
import { getValidToken } from '@/lib/connect'

export const dynamic = 'force-dynamic'

// Public read: renders a connected sheet's rows on a page (owner's token, server-side).
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const range = req.nextUrl.searchParams.get('range') || 'A1:E20'
  if (!id) return NextResponse.json({ rows: [] })
  try {
    const token = await getValidToken('google-sheets')
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values/${encodeURIComponent(range)}`
    const r = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
    if (!r.ok) return NextResponse.json({ rows: [], error: `Sheets error ${r.status}` })
    const d = await r.json()
    return NextResponse.json({ rows: d.values || [] })
  } catch (e: any) {
    return NextResponse.json({ rows: [], error: String(e?.message || e) })
  }
}
