import { NextRequest, NextResponse } from 'next/server'
import { addCustomConnector, removeCustomConnector, getCustomConnectors } from '@/lib/custom-connectors'
import type { Connector, CustomAction } from '@/lib/connectors'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function cleanActions(raw: any): CustomAction[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((a) => a && a.label && a.path).slice(0, 30).map((a) => ({
    id: slugify(a.id || a.label), label: String(a.label).slice(0, 60),
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(String(a.method).toUpperCase()) ? String(a.method).toUpperCase() : 'GET',
    path: String(a.path).slice(0, 300), body: a.body ? String(a.body).slice(0, 4000) : undefined,
  }))
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const type = b.type || b.auth
  if (!b.name || (type !== 'oauth2' && type !== 'rest')) {
    return NextResponse.json({ error: 'Name and a valid type (oauth2 or rest) are required.' }, { status: 400 })
  }
  const id = 'custom-' + slugify(b.id?.replace(/^custom-/, '') || b.name)
  const base: Connector = {
    id, name: String(b.name).slice(0, 60), category: String(b.category || 'Custom').slice(0, 40),
    brand: b.brand || 'custom', description: String(b.description || '').slice(0, 160), custom: true, scopes: [],
    actions: cleanActions(b.actions),
  }
  let connector: Connector
  if (type === 'oauth2') {
    if (!b.authorizeUrl || !b.tokenUrl || !b.clientId || !b.clientSecret) {
      return NextResponse.json({ error: 'OAuth needs authorizeUrl, tokenUrl, clientId, and clientSecret.' }, { status: 400 })
    }
    connector = {
      ...base, auth: 'oauth2',
      authorizeUrl: b.authorizeUrl, tokenUrl: b.tokenUrl,
      clientId: b.clientId, clientSecret: b.clientSecret, baseUrl: b.baseUrl || undefined,
      scopes: typeof b.scopes === 'string' ? b.scopes.split(/[\s,]+/).filter(Boolean) : (Array.isArray(b.scopes) ? b.scopes : []),
      tokenAuth: b.tokenAuth === 'basic' ? 'basic' : 'body',
      pkce: !!b.pkce, userInfoUrl: b.userInfoUrl || undefined, accountEmailPath: b.accountEmailPath || undefined,
    }
  } else {
    if (!b.baseUrl) return NextResponse.json({ error: 'REST needs a baseUrl.' }, { status: 400 })
    connector = { ...base, auth: 'rest', baseUrl: b.baseUrl, restAuthHeader: b.restAuthHeader || undefined, restAuthValue: b.restAuthValue || undefined }
  }
  await addCustomConnector(connector)
  return NextResponse.json({ ok: true, id })
}

// Export a shareable connector definition (secrets stripped).
export async function GET(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  const list = await getCustomConnectors()
  const c = list.find((x) => x.id === id)
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { clientSecret, restAuthValue, clientId, ...shareable } = c as any
  return NextResponse.json({ ...shareable, type: c.auth })
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await removeCustomConnector(id)
  return NextResponse.json({ ok: true })
}
