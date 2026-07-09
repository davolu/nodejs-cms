import { NextRequest, NextResponse } from 'next/server'
import { getValidToken } from '@/lib/connect'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit')) || 10)
  try {
    const token = await getValidToken('google-drive')
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=${limit}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)`
    const r = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
    if (!r.ok) return NextResponse.json({ files: [], error: `Drive error ${r.status}` })
    const d = await r.json()
    return NextResponse.json({ files: d.files || [] })
  } catch (e: any) {
    return NextResponse.json({ files: [], error: String(e?.message || e) })
  }
}
