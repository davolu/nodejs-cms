import crypto from 'crypto'
import type { Connector } from './connectors'

const SECRET = () => process.env.AUTH_SECRET || 'dev-insecure-secret-change-me'
const b64url = (b: Buffer) => b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

// ── Signed OAuth state (CSRF + carries the PKCE verifier) ──
export function signState(payload: { c: string; n: string; v?: string }): string {
  const body = b64url(Buffer.from(JSON.stringify({ ...payload, t: Date.now() })))
  const sig = b64url(crypto.createHmac('sha256', SECRET()).update(body).digest())
  return `${body}.${sig}`
}
export function verifyState(token?: string): { c: string; n: string; v?: string } | null {
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  const expected = b64url(crypto.createHmac('sha256', SECRET()).update(body).digest())
  if (sig !== expected) return null
  try {
    const data = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    if (Date.now() - data.t > 10 * 60 * 1000) return null // 10 min
    return data
  } catch { return null }
}

// ── PKCE (S256) ──
export function pkcePair(): { verifier: string; challenge: string } {
  const verifier = b64url(crypto.randomBytes(32))
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest())
  return { verifier, challenge }
}

export function buildAuthUrl(c: Connector, redirectUri: string, state: string, challenge?: string): string {
  const p = new URLSearchParams({
    client_id: c.clientId || process.env[c.clientIdEnv || ''] || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  })
  if (c.scopes.length) p.set('scope', c.scopes.join(c.scopeSeparator || ' '))
  for (const [k, v] of Object.entries(c.extraAuthParams || {})) p.set(k, v)
  if (c.pkce && challenge) { p.set('code_challenge', challenge); p.set('code_challenge_method', 'S256') }
  return `${c.authorizeUrl}?${p.toString()}`
}

export interface TokenSet { access_token: string; refresh_token?: string; expires_in?: number; scope?: string; [k: string]: any }

async function tokenRequest(c: Connector, params: Record<string, string>): Promise<TokenSet> {
  const clientId = c.clientId || process.env[c.clientIdEnv || ''] || ''
  const clientSecret = c.clientSecret || process.env[c.clientSecretEnv || ''] || ''
  const headers: Record<string, string> = { 'content-type': 'application/x-www-form-urlencoded' }
  if (c.acceptJson) headers['accept'] = 'application/json'

  const body = new URLSearchParams(params)
  if (c.tokenAuth === 'basic') {
    headers['authorization'] = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  } else {
    body.set('client_id', clientId)
    body.set('client_secret', clientSecret)
  }

  const resp = await fetch(c.tokenUrl || '', { method: 'POST', headers, body: body.toString() })
  const text = await resp.text()
  let data: any
  try { data = JSON.parse(text) } catch { data = Object.fromEntries(new URLSearchParams(text)) }
  if (!resp.ok || data.error) throw new Error(data.error_description || data.error || `Token exchange failed (${resp.status})`)
  return data
}

export function exchangeCode(c: Connector, code: string, redirectUri: string, verifier?: string): Promise<TokenSet> {
  const params: Record<string, string> = { grant_type: 'authorization_code', code, redirect_uri: redirectUri }
  if (c.pkce && verifier) params.code_verifier = verifier
  return tokenRequest(c, params)
}

export function refreshToken(c: Connector, refresh: string): Promise<TokenSet> {
  return tokenRequest(c, { grant_type: 'refresh_token', refresh_token: refresh })
}

export function pick(obj: any, path?: string): string {
  if (!path) return ''
  return String(path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj) ?? '')
}
