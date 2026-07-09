import { NextRequest, NextResponse } from 'next/server'
import { THEME_NAMES } from '@/lib/blocks'
import { collectionsRepo, pagesRepo, settingsRepo } from '@/lib/store'
import { connectorConnected } from '@/lib/connect'
import { BLOCK_SCHEMA_DOC, SITE_WIDGETS, WIDGET_REQUIRES, normalizeBlocks, S } from '@/lib/ai-page'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const slug = (s: string) => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'page'
const ACCESS = ['public', 'members', 'subscribers', 'managers', 'admins']
const FIELD_TYPES = ['text', 'textarea', 'image', 'url', 'number', 'date', 'boolean']

function buildSystem(widgetLines: string) {
  return `You are a web studio that designs COMPLETE multi-page websites for a block-based CMS.
Plan a coherent site for the user's request: choose a theme, the right pages, a navigation menu, and any content collections the site needs. Write real, specific copy — never lorem ipsum.

Return ONLY valid JSON (no markdown) with this shape:
{
  "site": { "title": string, "description": string(<160 chars), "theme": one of ["indigo","violet","emerald","teal","sky","rose","amber","slate"] },
  "collections": [ { "name": string, "slug": string, "ownership": "shared"|"own", "fields": [ { "label": string, "type": "text"|"textarea"|"image"|"url"|"number"|"date"|"boolean" } ] } ],
  "navigation": { "items": [ { "label": string, "href": "/slug" } ], "cta": { "label": string, "href": "/slug" } },
  "pages": [ { "title": string, "slug": string, "home": boolean, "access": "public"|"members"|"subscribers"|"managers"|"admins", "blocks": Block[] } ]
}

${BLOCK_SCHEMA_DOC}

Rules:
- 3 to 6 pages. Exactly one page has "home": true (usually slug "home").
- Navigation hrefs must be "/" + a page slug you created (home links to "/").
- Only create collections the site actually needs (e.g. Projects, Jobs, Menu, Team). Use "own" ownership only for per-member data (e.g. a client portal). Reference a collection in a widget by its slug.
- Use widgets where they fit. Keep each page focused (4-8 blocks). Do not include ids.${widgetLines}`
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured. Add ANTHROPIC_API_KEY to your environment.' }, { status: 400 })

  const { prompt } = await req.json().catch(() => ({}))
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'Describe the site you want to build.' }, { status: 400 })

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
  const available: string[] = []
  for (const type of Object.keys(SITE_WIDGETS)) {
    const need = WIDGET_REQUIRES[type]
    if (!need || (await connectorConnected(need))) available.push(type)
  }
  const widgetLines = available.length ? `\n\nAvailable widgets (use as { "type":"<type>", ...fields }):\n` + available.map((t) => `- ${t}: ${SITE_WIDGETS[t]}`).join('\n') : ''

  let parsed: any
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 6000, system: buildSystem(widgetLines), messages: [{ role: 'user', content: `Build a website for: ${prompt}` }] }),
    })
    if (!resp.ok) {
      const detail = await resp.text().catch(() => '')
      return NextResponse.json({ error: `Anthropic API error (${resp.status}).`, detail: detail.slice(0, 300) }, { status: 502 })
    }
    const data = await resp.json()
    const text: string = Array.isArray(data?.content) ? data.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') : ''
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const start = cleaned.indexOf('{'), end = cleaned.lastIndexOf('}')
    parsed = JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to generate the site plan. Try rephrasing.', detail: String(e?.message || e).slice(0, 200) }, { status: 500 })
  }

  const theme = THEME_NAMES.includes(parsed?.site?.theme) ? parsed.site.theme : 'indigo'

  // 1) Create collections and map slug -> id (so widgets can reference them).
  const collectionMap: Record<string, string> = {}
  const createdCollections: string[] = []
  for (const c of Array.isArray(parsed?.collections) ? parsed.collections.slice(0, 8) : []) {
    if (!c?.name) continue
    const fields = (Array.isArray(c.fields) ? c.fields : []).filter((f: any) => f?.label).map((f: any) => ({
      key: slug(f.label).replace(/-/g, '_'), label: String(f.label).slice(0, 60),
      type: FIELD_TYPES.includes(f.type) ? f.type : 'text',
    })).slice(0, 12)
    const created = await collectionsRepo.create({ name: String(c.name).slice(0, 60), slug: slug(c.slug || c.name), fields, ownership: c.ownership === 'own' ? 'own' : 'shared' })
    collectionMap[created.slug] = created.id
    if (c.slug) collectionMap[slug(c.slug)] = created.id
    createdCollections.push(created.name)
  }

  // 2) Create pages.
  const pages = Array.isArray(parsed?.pages) ? parsed.pages.slice(0, 8) : []
  const usedSlugs = new Set<string>()
  let homeId = ''
  const created: { title: string; slug: string; home: boolean }[] = []
  for (const p of pages) {
    if (!p?.title) continue
    let s = slug(p.slug || p.title)
    while (usedSlugs.has(s)) s = s + '-2'
    usedSlugs.add(s)
    const blocks = normalizeBlocks(p.blocks, { allow: SITE_WIDGETS, collectionMap })
    if (blocks.length === 0) continue
    const access = ACCESS.includes(p.access) ? p.access : 'public'
    const page = await pagesRepo.create({ title: String(p.title).slice(0, 120), slug: s, blocks, theme, access, status: 'published' })
    if (p.home && !homeId) homeId = page.id
    created.push({ title: page.title, slug: page.slug, home: !!p.home })
  }
  if (!homeId && created[0]) { const first = await pagesRepo.getBySlug(created[0].slug); if (first) homeId = first.id }

  // 3) Wire navigation, home page, and site meta.
  const navItems = (Array.isArray(parsed?.navigation?.items) ? parsed.navigation.items : [])
    .filter((i: any) => i?.label && i?.href).map((i: any) => ({ label: String(i.label).slice(0, 40), href: String(i.href).slice(0, 120) })).slice(0, 8)
  const cta = parsed?.navigation?.cta
  await settingsRepo.upsertMany([
    { key: 'home_page_id', value: homeId },
    { key: 'nav_menu', value: JSON.stringify(navItems) },
    { key: 'header_cta_label', value: cta?.label ? String(cta.label).slice(0, 40) : '' },
    { key: 'header_cta_href', value: cta?.href ? String(cta.href).slice(0, 120) : '' },
    { key: 'site_title', value: S(parsed?.site?.title).slice(0, 80) },
    { key: 'site_description', value: S(parsed?.site?.description).slice(0, 160) },
  ])

  if (created.length === 0) return NextResponse.json({ error: 'The model did not return usable pages. Try rephrasing.' }, { status: 422 })
  return NextResponse.json({ ok: true, site: { title: S(parsed?.site?.title), theme }, pages: created, collections: createdCollections })
}
