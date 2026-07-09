import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_BRAND, HEADING_FONTS, BODY_FONTS, Brand } from '@/lib/brand'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const hex = (v: any, d: string) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim() : d)
const pick = (v: any, list: string[], d: string) => (list.includes(v) ? v : d)

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured. Add ANTHROPIC_API_KEY.' }, { status: 400 })
  const { prompt } = await req.json().catch(() => ({}))
  if (!prompt) return NextResponse.json({ error: 'Describe your brand.' }, { status: 400 })

  const system = `You are a brand designer. Given a brand brief, return a cohesive, professional style guide as JSON ONLY (no markdown):
{
  "primary": "#RRGGBB",   // main brand color
  "accent": "#RRGGBB",    // complementary accent (works in a gradient with primary)
  "bg": "#RRGGBB",        // page background (usually near-white or a soft tint; dark only if the brief wants it)
  "surface": "#RRGGBB",   // cards (usually #ffffff or very light)
  "text": "#RRGGBB",      // body text (high contrast on bg)
  "heading": "#RRGGBB",   // heading text (often darker than body)
  "headingFont": one of ${JSON.stringify(HEADING_FONTS)},
  "bodyFont": one of ${JSON.stringify(BODY_FONTS)},
  "radius": number,        // 0-24 corner radius; small=sharp/corporate, large=friendly
  "buttonStyle": "rounded"|"pill"|"square"
}
Choose colors with real contrast and taste. Match the personality of the brief (fintech=trust/blue, wellness=calm/green, luxury=dark/serif, playful=bright/rounded). Ensure text is readable on bg.`

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6', max_tokens: 600, system, messages: [{ role: 'user', content: `Brand brief: ${prompt}` }] }),
    })
    if (!resp.ok) return NextResponse.json({ error: `AI error (${resp.status}).` }, { status: 502 })
    const data = await resp.json()
    const text: string = Array.isArray(data?.content) ? data.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') : ''
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}')
    const p = JSON.parse(s >= 0 && e > s ? cleaned.slice(s, e + 1) : cleaned)

    const brand: Brand = {
      primary: hex(p.primary, DEFAULT_BRAND.primary), accent: hex(p.accent, DEFAULT_BRAND.accent),
      bg: hex(p.bg, DEFAULT_BRAND.bg), surface: hex(p.surface, DEFAULT_BRAND.surface),
      text: hex(p.text, DEFAULT_BRAND.text), heading: hex(p.heading, DEFAULT_BRAND.heading),
      headingFont: pick(p.headingFont, HEADING_FONTS, DEFAULT_BRAND.headingFont),
      bodyFont: pick(p.bodyFont, BODY_FONTS, DEFAULT_BRAND.bodyFont),
      radius: Math.max(0, Math.min(24, Math.round(Number(p.radius)) || DEFAULT_BRAND.radius)),
      buttonStyle: ['rounded', 'pill', 'square'].includes(p.buttonStyle) ? p.buttonStyle : DEFAULT_BRAND.buttonStyle,
    }
    return NextResponse.json({ brand })
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not generate a brand. Try again.' }, { status: 500 })
  }
}
