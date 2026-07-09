import { cookies } from 'next/headers'

// Demo authentication. Swap checkCredentials for a real user lookup + password
// hash (e.g. bcrypt against a users table) when moving beyond the prototype.
export const SESSION_COOKIE = 'cms_session'
export const SESSION_VALUE = 'authed'

export const DEMO_EMAIL = 'admin@acme.com'
export const DEMO_PASSWORD = 'admin123'

export function checkCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
}

export function isAuthed(): boolean {
  return cookies().get(SESSION_COOKIE)?.value === SESSION_VALUE
}
