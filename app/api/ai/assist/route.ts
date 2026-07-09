import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 45

type Action = 'draft' | 'improve' | 'shorten' | 'expand' | 'rewrite' | 'excerpt' | 'seo' | 'titles' | 'alt'

// Builds the instruction + whether we expect JSON back.
function buildPrompt(action: Action, text: string, title: string): { user: string; json: boolean } {
  const t = (text || '').slice(0, 8000)
  switch (action) {
    case 'draft':
      return { json: false, user: `Write a clear, engaging blog post body for the title: "${title}". Use a few short paragraphs. Plain text only (no markdown headings, no title). ${t ? `Existing notes to build on:\n${t}` : ''}` }
    case 'improve':
      return { json: false, user: `Improve the writing below — clearer, more engaging, fix grammar — keeping the meaning and roughly the same length. Return only the revised text:\n\n${t}` }
    case 'shorten':
      return { json: false, user: `Make the text below more concise while keeping the key points. Return only the revised text:\n\n${t}` }
    case 'expand':
      return { json: false, user: `Expand the text below with more detail and examples, keeping the tone. Return only the revised text:\n\n${t}` }
    case 'rewrite':
      return { json: false, user: `Rewrite the text below in a fresh way with the same meaning. Return only the rewritten text:\n\n${t}` }
    case 'excerpt':
      return { json: false, user: `Write a one or two sentence summary (max 220 chars) of the content below, for a blog listing. Return only the summary:\n\n${t}` }
    case 'alt':
      return { json: false, user: `Write concise, descriptive alt text (max 120 chars) for an image described/used in this context. Return only the alt text:\n\n${t || title}` }
    case 'seo':
      return { json: true, user: `Based on the content below (title: "${title}"), produce SEO metadata. Return ONLY JSON: {"metaTitle": string (<=60 chars), "metaDescription": string (<=155 chars)}.\n\n${t}` }
    case 'titles':
      return { json: true, user: `Suggest 5 strong, specific blog post titles for this topic/draft. Return ONLY JSON: {"titles": string[]}.\n\nTopic: ${title}\n${t}` }
    default:
      return { json: false, user: t }
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured. Add ANTHROPIC_API_KEY to your environment.' }, { status: 400 })

  const { action, text, title } = await req.json().catch(() => ({}))
  const actions: Action[] = ['draft', 'improve', 'shorten', 'expand', 'rewrite', 'excerpt', 'seo', 'titles', 'alt']
  if (!actions.includes(action)) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  if (action !== 'draft' && action !== 'titles' && action !== 'alt' && !String(text || '').trim()) {
    return NextResponse.json({ error: 'Nothing to work with yet — add some content first.' }, { status: 400 })
  }

  const { user, json } = buildPrompt(action, text || '', title || '')
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model, max_tokens: 1500,
        system: 'You are a concise, skilled writing assistant for a CMS. Follow the instruction exactly and return only what is asked — no preamble, no quotes around the whole answer.',
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!resp.ok) {
      const detail = await resp.text().catch(() => '')
      return NextResponse.json({ error: `Anthropic API error (${resp.status}).`, detail: detail.slice(0, 200) }, { status: 502 })
    }
    const data = await resp.json()
    const raw: string = Array.isArray(data?.content) ? data.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('').trim() : ''

    if (json) {
      const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
      const start = cleaned.indexOf('{'), end = cleaned.lastIndexOf('}')
      const parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned)
      return NextResponse.json(parsed)
    }
    return NextResponse.json({ result: raw })
  } catch (e: any) {
    return NextResponse.json({ error: 'AI request failed.', detail: String(e?.message || e).slice(0, 200) }, { status: 500 })
  }
}
