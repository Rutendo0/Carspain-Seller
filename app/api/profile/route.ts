import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

// Shape of profile data stored in Firestore
interface ProfileData {
  name?: string
  phone?: string
  avatarUrl?: string
  companyName?: string
  taxId?: string
  vatNumber?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  stripeAccountId?: string
  // Derived Stripe flags (not persisted necessarily)
  payoutsEnabled?: boolean
  detailsSubmitted?: boolean
}

const addressSchema = z.object({
  line1: z.string().max(200).optional().or(z.literal('')),
  line2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  state: z.string().max(120).optional().or(z.literal('')),
  postalCode: z.string().max(40).optional().or(z.literal('')),
  country: z.string().length(2).optional().or(z.literal('')),
}).optional()

const profileSchema = z.object({
  name: z.string().max(120).optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  avatarUrl: z.string().url().max(2048).optional().or(z.literal('')),
  companyName: z.string().max(160).optional().or(z.literal('')),
  taxId: z.string().max(80).optional().or(z.literal('')),
  vatNumber: z.string().max(80).optional().or(z.literal('')),
  address: addressSchema,
})

async function getUidFromCookie() {
  const token = cookies().get('__session')?.value
  if (!token) return null
  try {
    if (adminAuth) {
      const decoded = await adminAuth.verifyIdToken(token)
      return { uid: decoded.uid, email: decoded.email }
    } else {
      // Fallback for dev - insecure, decode without verify
      const decoded = jwt.decode(token) as any
      return { uid: decoded.sub || decoded.uid, email: decoded.email }
    }
  } catch {
    return null
  }
}

export async function GET() {
  const auth = await getUidFromCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!adminDb) {
    return NextResponse.json({ error: 'Admin not initialized' }, { status: 500 })
  }

  try {
    const docRef = adminDb.collection('users').doc(auth.uid)
    const snap = await docRef.get()
    const data = (snap.exists ? (snap.data() as ProfileData) : {}) || {}

    // Enrich with Stripe status if accountId present
    if (data.stripeAccountId) {
      try {
        const account = await stripe.accounts.retrieve(data.stripeAccountId)
        data.payoutsEnabled = !!account.charges_enabled && !!account.payouts_enabled
        data.detailsSubmitted = !!account.details_submitted
      } catch {
        // ignore stripe errors here; return stored data
      }
    }

    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await getUidFromCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!adminDb) {
    return NextResponse.json({ error: 'Admin not initialized' }, { status: 500 })
  }

  try {
    const json = await request.json()
    const parsed = profileSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Validation failed',
        issues: parsed.error.flatten(),
      }, { status: 400 })
    }
    const body = parsed.data

    const update: ProfileData = {
      name: body.name || undefined,
      phone: body.phone || undefined,
      avatarUrl: body.avatarUrl || undefined,
      companyName: body.companyName || undefined,
      taxId: body.taxId || undefined,
      vatNumber: body.vatNumber || undefined,
      address: body.address ? {
        line1: body.address.line1 || undefined,
        line2: body.address.line2 || undefined,
        city: body.address.city || undefined,
        state: body.address.state || undefined,
        postalCode: body.address.postalCode || undefined,
        country: body.address.country ? body.address.country.toUpperCase() : undefined,
      } : undefined,
    }

    await adminDb.collection('users').doc(auth.uid).set(update, { merge: true })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}