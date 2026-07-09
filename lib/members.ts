import { cookies } from 'next/headers'
import crypto from 'crypto'

// Public member auth — fully separate from the admin login.
export const MEMBER_COOKIE = 'cms_member'
const SECRET = process.env.AUTH_SECRET || 'dev-insecure-change-me-in-production'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = (stored || '').split(':')
  if (!salt || !hash) return false
  const h = crypto.scryptSync(pw, salt, 64)
  const b = Buffer.from(hash, 'hex')
  return h.length === b.length && crypto.timingSafeEqual(h, b)
}

export function signSession(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ u: userId, e: Date.now() + MAX_AGE * 1000 })).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySession(token?: string): string | null {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    const { u, e } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!u || Date.now() > e) return null
    return u
  } catch {
    return null
  }
}

export function getMemberId(): string | null {
  return verifySession(cookies().get(MEMBER_COOKIE)?.value)
}

export { MAX_AGE as MEMBER_MAX_AGE }
