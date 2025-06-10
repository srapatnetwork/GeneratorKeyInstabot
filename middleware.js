import { NextResponse } from 'next/server'

export function middleware(req) {
  const url = req.nextUrl
  const isProtected = url.pathname.startsWith('/generate') || url.pathname.startsWith('/admin')

  if (!isProtected) return NextResponse.next()

  const basicAuth = req.headers.get('authorization')

  if (!basicAuth) {
    return new NextResponse('Auth Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"'
      }
    })
  }

  try {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    const username = process.env.ADMIN_USERNAME
    const password = process.env.ADMIN_PASSWORD

    if (user !== username || pwd !== password) {
      return new NextResponse('Unauthorized', { status: 403 })
    }
  } catch {
    return new NextResponse('Invalid Authorization Header', { status: 400 })
  }

  return NextResponse.next()
}
