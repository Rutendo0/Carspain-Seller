import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin'
import jwt from 'jsonwebtoken'
import { saveAvatar } from '@/lib/neon'
import crypto from 'node:crypto'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('=== Upload API Called ===')
  
  const token = cookies().get('__session')?.value
  if (!token) {
    console.log('No token provided')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let uid: string;
  try {
    if (adminAuth) {
      await adminAuth.verifyIdToken(token)
    }
    // Decode token to get uid (dev only, insecure - verify in production)
    const decoded = jwt.decode(token) as any
    uid = decoded.sub || decoded.uid
    console.log('UID from token:', uid)
  } catch (err) {
    console.log('Token decode failed:', (err as Error).message)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Processing formData...')
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    console.log('File found:', !!file)
    if (!file) {
      console.log('No file in formData')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileType = file.type;
    console.log('File name:', file.name, 'Size:', file.size, 'Type:', fileType)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileSize = buffer.length;
    console.log('Buffer size:', fileSize)

    // 5MB limit
    if (fileSize === 0 || fileSize > 5 * 1024 * 1024) {
      console.log('Invalid file size:', fileSize)
      return NextResponse.json({ error: 'Invalid file size' }, { status: 400 })
    }

    // Convert to base64
    const base64 = buffer.toString('base64')
    console.log('Base64 length:', base64.length)

    const url = await saveAvatar(uid, base64, fileType)
    console.log('Avatar saved, URL:', url)

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed: ' + (error?.message || 'Unknown error') }, { status: 500 })
  }
}