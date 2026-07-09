import { NextResponse } from 'next/server'
import { settingsRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const raw = await settingsRepo.get('installed_apps')
  let installed: string[] = []
  try { const v = JSON.parse(raw || '[]'); installed = Array.isArray(v) ? v : [] } catch {}
  return NextResponse.json({ installed })
}
