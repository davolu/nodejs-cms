import { NextRequest, NextResponse } from 'next/server'
import { THEME_NAMES } from '@/lib/blocks'
import { connectorConnected } from '@/lib/connect'
import { BLOCK_SCHEMA_DOC, PAGE_WIDGETS, WIDGET_REQUIRES, normalizeBlocks, S } from '@/lib/ai-page'

export const dynamic = 'force-dynamic'
export const maxDuration = 45

const SYSTEM = `You are a web designer that lays out marketing pages for a block-based CMS.
Design the page to fit the user's prompt — vary the THEME, layout, section order, and block VARIANTS so pages for different prompts look genuinely different (not one fixed template).

Return ONLY valid JSON (no markdown) with this shape:
{
  "title": string,
  "metaTitle": string,
  "metaDescription": string,            // under 160 chars
  "theme": one of ["indigo","violet","emerald","teal","sky","rose","amber","slate"],
  "blocks": Block[]
}

${BLOCK_SCHEMA_DOC}

Guidance: Start with a hero (choose a variant that suits the vibe). Use 4-7 blocks. Mix in features/stats/cta where they fit. Choose different hero variants and themes for different kinds of businesses. Keep copy concise, specific, and professional. Do not include ids.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured. Add ANTHROPIC_API_KEY to your environment variables.' }, { status: 400 })

  const { prompt } = await req.json().catch(() => ({}))
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'Describe the page you want to generate.' }, { status: 400 })

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

  // Offer only integration widgets whose connector is available.
  const available: string[] = []
  for (const type of Object.keys(PAGE_WIDGETS)) {
    const need = WIDGET_REQUIRES[type]
    if (!need || (await connectorConnected(need))) available.push(type)
  }
  const widgetNote = available.length
    ? `\n\nYou may ALSO use these widget blocks where they fit (each as { "type": "<type>", ...fields }):\n` +
      available.map((t) => `- ${t}: ${PAGE_WIDGETS[t]}`).join('\n') + `\nOnly use a widget when it genuinely fits the request.`
    : ''

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 2200, system: SYSTEM + widgetNote, messages: [{ role: 'user', content: `Design a page for: ${prompt}` }] }),
    })
    if (!resp.ok) {
      const detail = await resp.text().catch(() => '')
      return NextResponse.json({ error: `Anthropic API error (${resp.status}). Check your API key and model.`, detail: detail.slice(0, 300) }, { status: 502 })
    }
    const data = await resp.json()
    const text: string = Array.isArray(data?.content) ? data.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') : ''
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const start = cleaned.indexOf('{'), end = cleaned.lastIndexOf('}')
    const parsed = JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned)

    const blocks = normalizeBlocks(parsed.blocks, { allow: PAGE_WIDGETS })
    if (blocks.length === 0) return NextResponse.json({ error: 'The model did not return usable blocks. Try rephrasing.' }, { status: 422 })

    const theme = THEME_NAMES.includes(parsed.theme) ? parsed.theme : 'indigo'
    return NextResponse.json({ title: S(parsed.title), metaTitle: S(parsed.metaTitle), metaDescription: S(parsed.metaDescription).slice(0, 160), theme, blocks })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to generate page.', detail: String(e?.message || e).slice(0, 300) }, { status: 500 })
  }
}
