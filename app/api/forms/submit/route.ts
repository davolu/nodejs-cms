import { NextRequest, NextResponse } from 'next/server'
import { submissionsRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Optional email notification via Resend. No-ops cleanly if not configured.
async function notify(form: string, data: Record<string, string>, page: string) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.NOTIFY_EMAIL
  const from = process.env.FROM_EMAIL || 'ContentHub <onboarding@resend.dev>'
  if (!key || !to) return
  const rows = Object.entries(data).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${k}</td><td style="padding:4px 0">${String(v)}</td></tr>`).join('')
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from, to,
        subject: `New "${form}" submission`,
        html: `<h2>New ${form} submission</h2><p style="color:#64748b">From page: ${page || '/'}</p><table>${rows}</table>`,
      }),
    })
  } catch { /* notification is best-effort */ }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  // Honeypot: bots fill hidden fields; silently accept and drop.
  if (body && typeof body._gotcha === 'string' && body._gotcha.trim() !== '') {
    return NextResponse.json({ ok: true })
  }
  const data = body?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
  }
  // Coerce values to strings and cap sizes.
  const clean: Record<string, string> = {}
  for (const [k, v] of Object.entries(data).slice(0, 30)) {
    clean[String(k).slice(0, 100)] = String(v ?? '').slice(0, 5000)
  }
  const form = String(body?.form || 'Form').slice(0, 120)
  const page = String(body?.page || '').slice(0, 300)

  try {
    await submissionsRepo.create({ form, data: clean, page })
    await notify(form, clean, page)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not save submission.' }, { status: 500 })
  }
}
