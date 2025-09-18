import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth) {
      return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.substring(7)
    await adminAuth.verifyIdToken(idToken)

    const response = NextResponse.json({ success: true })
    const isHttps = request.nextUrl.protocol === 'https:'
    response.cookies.set('__session', idToken, {
      httpOnly: true,
      secure: isHttps, // only secure on HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5 // 5 days
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
export const runtime = 'nodejs';