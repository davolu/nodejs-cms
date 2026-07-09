import { NextRequest, NextResponse } from 'next/server'
import { getValidToken } from '@/lib/connect'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const limit = Math.min(10, Number(req.nextUrl.searchParams.get('limit')) || 5)
  try {
    const token = await getValidToken('google-calendar')
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(new Date().toISOString())}&singleEvents=true&orderBy=startTime&maxResults=${limit}`
    const r = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
    if (!r.ok) return NextResponse.json({ events: [], error: `Calendar error ${r.status}` })
    const d = await r.json()
    const events = (d.items || []).map((e: any) => ({ id: e.id, summary: e.summary || '(no title)', start: e.start?.dateTime || e.start?.date, location: e.location || '', htmlLink: e.htmlLink }))
    return NextResponse.json({ events })
  } catch (e: any) {
    return NextResponse.json({ events: [], error: String(e?.message || e) })
  }
}
