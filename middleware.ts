import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'cms_session'
const SESSION_VALUE = 'authed'

export function middleware(req: NextRequest) {
  const authed = req.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !authed) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname === '/login' && authed) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
