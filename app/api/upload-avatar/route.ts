import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminStorage } from '@/lib/firebase-admin'
import crypto from 'node:crypto'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const token = cookies().get('__session')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await adminAuth.verifyIdToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 5MB limit
    if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Invalid file size' }, { status: 400 })
    }

    const storagePath = `Images/${Date.now()}-${file.name}`

    // Resolve and normalize bucket
    const rawBucket = process.env.FIREBASE_STORAGE_BUCKET
      || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      || (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.appspot.com` : undefined)

    const bucketName = rawBucket?.replace('.firebasestorage.app', '.appspot.com')
    if (!bucketName) {
      return NextResponse.json({ error: 'Storage bucket is not configured' }, { status: 500 })
    }

    const bucket = adminStorage.bucket(bucketName)
    const fileRef = bucket.file(storagePath)
    const downloadToken = crypto.randomUUID()

    const metadata = {
      contentType: file.type || 'application/octet-stream',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    }

    // Use write stream for clearer errors and robustness
    await new Promise<void>((resolve, reject) => {
      const stream = fileRef.createWriteStream({
        resumable: false,
        metadata,
      })
      stream.on('error', (err) => reject(err))
      stream.on('finish', () => resolve())
      stream.end(buffer)
    })

    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`

    return NextResponse.json({ url: downloadURL })
  } catch (error: any) {
    console.error('Upload error:', error?.message || error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}