import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();

  // Proteksi hanya halaman /generate
  if (url.pathname === '/generate') {
    const auth = req.headers.get('authorization');
    const expected = 'Basic ' + Buffer.from('admin:' + process.env.ADMIN_PASSWORD).toString('base64');

    if (auth !== expected) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Access to /generate", charset="UTF-8"',
        },
      });
    }
  }

  return NextResponse.next();
}
