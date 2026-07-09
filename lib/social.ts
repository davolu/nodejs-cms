import type { Connector } from './connectors'

// Minimal OAuth configs for VISITOR sign-in (distinct from owner connectors).
// They reuse the same client credentials as the Google/GitHub connectors, but request
// only identity scopes — so "Connect Google" and "Sign in with Google" share one setup.
export const SOCIAL: Record<string, Connector> = {
  google: {
    id: 'social-google', name: 'Google', brand: 'google', category: 'Auth', description: '', scopes: ['openid', 'email', 'profile'],
    clientIdEnv: 'GOOGLE_CLIENT_ID', clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token',
    extraAuthParams: { prompt: 'select_account' }, userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    accountEmailPath: 'email', accountNamePath: 'name',
  },
  github: {
    id: 'social-github', name: 'GitHub', brand: 'github', category: 'Auth', description: '', scopes: ['read:user', 'user:email'],
    clientIdEnv: 'GITHUB_CLIENT_ID', clientSecretEnv: 'GITHUB_CLIENT_SECRET',
    authorizeUrl: 'https://github.com/login/oauth/authorize', tokenUrl: 'https://github.com/login/oauth/access_token',
    acceptJson: true, userInfoUrl: 'https://api.github.com/user', accountEmailPath: 'email', accountNamePath: 'name',
  },
}

export function socialProvider(id: string): Connector | undefined { return SOCIAL[id] }
export function socialConfigured(id: string): boolean {
  const c = SOCIAL[id]
  return !!(c && process.env[c.clientIdEnv || ''] && process.env[c.clientSecretEnv || ''])
}
// Restrict post-login redirects to same-origin paths.
export function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/account'
  return next
}
