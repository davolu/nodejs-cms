import { NextRequest, NextResponse } from 'next/server'
import { Block, BlockType, blockId } from '@/lib/blocks'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const ALLOWED: BlockType[] = ['hero', 'heading', 'paragraph', 'image', 'button', 'quote']

const SYSTEM = `You generate website page content for a block-based CMS.
Return ONLY valid JSON (no markdown, no prose) with this exact shape:
{
  "title": string,
  "metaTitle": string,
  "metaDescription": string,
  "blocks": Block[]
}
Each Block is one of:
{ "type": "hero", "heading": string, "subheading": string }
{ "type": "heading", "text": string }
{ "type": "paragraph", "text": string }
{ "type": "image", "url": string, "alt": string }   // use https://picsum.photos/seed/<word>/1200/600 for url
{ "type": "button", "label": string, "href": string }
{ "type": "quote", "text": string, "cite": string }
Rules: Start with a hero. Use 4-8 blocks total. Keep copy concise and professional.
metaDescription must be under 160 characters. Do not include ids.`

// Normalize whatever the model returns into safe, valid blocks with fresh ids.
function normalizeBlocks(raw: any): Block[] {
  if (!Array.isArray(raw)) return []
  const out: Block[] = []
  for (const b of raw) {
    const type = b?.type as BlockType
    if (!ALLOWED.includes(type)) continue
    const id = blockId()
    switch (type) {
      case 'hero':
        out.push({ id, type, heading: String(b.heading || 'Headline'), subheading: String(b.subheading || '') })
        break
      case 'heading':
        out.push({ id, type, text: String(b.text || 'Heading') })
        break
      case 'paragraph':
        out.push({ id, type, text: String(b.text || '') })
        break
      case 'image':
        out.push({ id, type, url: String(b.url || `https://picsum.photos/seed/${id}/1200/600`), alt: String(b.alt || '') })
        break
      case 'button':
        out.push({ id, type, label: String(b.label || 'Learn more'), href: String(b.href || '#') })
        break
      case 'quote':
        out.push({ id, type, text: String(b.text || ''), cite: String(b.cite || '') })
        break
    }
  }
  return out
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI is not configured. Add ANTHROPIC_API_KEY to your environment variables.' },
      { status: 400 }
    )
  }

  const { prompt } = await req.json().catch(() => ({}))
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Describe the page you want to generate.' }, { status: 400 })
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1600,
        system: SYSTEM,
        messages: [{ role: 'user', content: `Create a page for: ${prompt}` }],
      }),
    })

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '')
      return NextResponse.json(
        { error: `Anthropic API error (${resp.status}). Check your API key and model.`, detail: detail.slice(0, 300) },
        { status: 502 }
      )
    }

    const data = await resp.json()
    const text: string = Array.isArray(data?.content)
      ? data.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('')
      : ''

    // Strip accidental code fences, then parse the first JSON object.
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    const json = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned
    const parsed = JSON.parse(json)

    const blocks = normalizeBlocks(parsed.blocks)
    if (blocks.length === 0) {
      return NextResponse.json({ error: 'The model did not return usable blocks. Try rephrasing.' }, { status: 422 })
    }

    return NextResponse.json({
      title: typeof parsed.title === 'string' ? parsed.title : '',
      metaTitle: typeof parsed.metaTitle === 'string' ? parsed.metaTitle : '',
      metaDescription: typeof parsed.metaDescription === 'string' ? parsed.metaDescription.slice(0, 160) : '',
      blocks,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to generate page.', detail: String(e?.message || e).slice(0, 300) }, { status: 500 })
  }
}
