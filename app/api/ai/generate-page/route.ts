import { NextRequest, NextResponse } from 'next/server'
import { Block, BlockType, blockId, variantsFor, THEME_NAMES } from '@/lib/blocks'

export const dynamic = 'force-dynamic'
export const maxDuration = 45

const ALLOWED: BlockType[] = ['hero', 'heading', 'paragraph', 'image', 'button', 'quote', 'features', 'stats', 'cta']

const SYSTEM = `You are a web designer that lays out marketing pages for a block-based CMS.
Design the page to fit the user's prompt — vary the THEME, layout, section order, and block VARIANTS so pages for different prompts look genuinely different (not one fixed template).

Return ONLY valid JSON (no markdown) with this shape:
{
  "title": string,
  "metaTitle": string,
  "metaDescription": string,            // under 160 chars
  "theme": one of ["indigo","violet","emerald","teal","sky","rose","amber","slate"],  // pick to match the mood
  "blocks": Block[]
}

Block types and their fields:
- hero: { "type":"hero", "variant": "gradient"|"image"|"light"|"split"|"minimal", "align":"left"|"center", "heading":string, "subheading":string, "label":string(optional button), "href":string, "url":string(only for image/split variants; use https://picsum.photos/seed/<word>/1200/800) }
- heading: { "type":"heading", "align":"left"|"center", "text":string }
- paragraph: { "type":"paragraph", "align":"left"|"center", "text":string }
- image: { "type":"image", "variant":"rounded"|"full"|"framed", "url":"https://picsum.photos/seed/<word>/1200/600", "alt":string }
- button: { "type":"button", "variant":"gradient"|"solid"|"outline", "label":string, "href":string }
- quote: { "type":"quote", "variant":"card"|"plain", "text":string, "cite":string }
- features: { "type":"features", "bg":"none"|"tint", "heading":string, "features":[{"title":string,"text":string}, ...3-4 items] }
- stats: { "type":"stats", "bg":"none"|"tint", "stats":[{"value":string,"label":string}, ...3 items] }
- cta: { "type":"cta", "variant":"brand"|"dark", "heading":string, "label":string, "href":string }

Guidance: Start with a hero (choose a variant that suits the vibe). Use 4-7 blocks. Mix in features/stats/cta where they fit the content. Choose different hero variants and themes for different kinds of businesses. Keep copy concise, specific, and professional. Do not include ids.`

function clampVariant(type: BlockType, v: any): string | undefined {
  const opts = variantsFor(type)
  if (opts.length === 0) return undefined
  return opts.includes(v) ? v : opts[0]
}
const clampAlign = (a: any) => (a === 'center' ? 'center' : 'left')
const clampBg = (g: any) => (g === 'tint' ? 'tint' : 'none')
const S = (v: any, d = '') => (typeof v === 'string' ? v : d)

function normalizeBlocks(raw: any): Block[] {
  if (!Array.isArray(raw)) return []
  const out: Block[] = []
  for (const b of raw) {
    const type = b?.type as BlockType
    if (!ALLOWED.includes(type)) continue
    const id = blockId()
    switch (type) {
      case 'hero':
        out.push({ id, type, variant: clampVariant(type, b.variant), align: clampAlign(b.align), heading: S(b.heading, 'Headline'), subheading: S(b.subheading), label: S(b.label), href: S(b.href, '#'), url: S(b.url, `https://picsum.photos/seed/${id}/1200/800`) })
        break
      case 'heading':
        out.push({ id, type, align: clampAlign(b.align), text: S(b.text, 'Heading') }); break
      case 'paragraph':
        out.push({ id, type, align: clampAlign(b.align), text: S(b.text) }); break
      case 'image':
        out.push({ id, type, variant: clampVariant(type, b.variant), url: S(b.url, `https://picsum.photos/seed/${id}/1200/600`), alt: S(b.alt) }); break
      case 'button':
        out.push({ id, type, variant: clampVariant(type, b.variant), align: clampAlign(b.align), label: S(b.label, 'Learn more'), href: S(b.href, '#') }); break
      case 'quote':
        out.push({ id, type, variant: clampVariant(type, b.variant), text: S(b.text), cite: S(b.cite) }); break
      case 'features': {
        const items = Array.isArray(b.features) ? b.features.slice(0, 6).map((f: any) => ({ title: S(f?.title, 'Feature'), text: S(f?.text) })) : []
        out.push({ id, type, bg: clampBg(b.bg), heading: S(b.heading), features: items.length ? items : [{ title: 'Feature', text: '' }] })
        break
      }
      case 'stats': {
        const items = Array.isArray(b.stats) ? b.stats.slice(0, 4).map((s: any) => ({ value: S(s?.value, '0'), label: S(s?.label, 'Label') })) : []
        out.push({ id, type, bg: clampBg(b.bg), stats: items.length ? items : [{ value: '0', label: 'Label' }] })
        break
      }
      case 'cta':
        out.push({ id, type, variant: clampVariant(type, b.variant), heading: S(b.heading, 'Ready to start?'), label: S(b.label, 'Get started'), href: S(b.href, '#') }); break
    }
  }
  return out
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured. Add ANTHROPIC_API_KEY to your environment variables.' }, { status: 400 })

  const { prompt } = await req.json().catch(() => ({}))
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'Describe the page you want to generate.' }, { status: 400 })

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 2200, system: SYSTEM, messages: [{ role: 'user', content: `Design a page for: ${prompt}` }] }),
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

    const blocks = normalizeBlocks(parsed.blocks)
    if (blocks.length === 0) return NextResponse.json({ error: 'The model did not return usable blocks. Try rephrasing.' }, { status: 422 })

    const theme = THEME_NAMES.includes(parsed.theme) ? parsed.theme : 'indigo'
    return NextResponse.json({
      title: S(parsed.title),
      metaTitle: S(parsed.metaTitle),
      metaDescription: S(parsed.metaDescription).slice(0, 160),
      theme,
      blocks,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to generate page.', detail: String(e?.message || e).slice(0, 300) }, { status: 500 })
  }
}
