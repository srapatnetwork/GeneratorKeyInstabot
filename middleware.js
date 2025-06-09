import { NextResponse } from 'next/server'

export function middleware(req) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  if (url.pathname.startsWith('/generate')) {
    if (!basicAuth) {
      return new NextResponse('Auth Required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
      })
    }

    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (
      user !== process.env.ADMIN_USERNAME ||
      pwd !== process.env.ADMIN_PASSWORD
    ) {
      return new NextResponse('Unauthorized', { status: 403 })
    }
  }

  return NextResponse.next()
}
