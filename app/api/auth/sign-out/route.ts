import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  const isHttps = request.nextUrl.protocol === 'https:'
  response.cookies.set('__session', '', {
    httpOnly: true,
    secure: isHttps, // mirror secure logic
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}