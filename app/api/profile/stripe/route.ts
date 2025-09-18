import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

async function getUidFromCookie() {
  const token = cookies().get('__session')?.value
  if (!token) return null
  if (!adminAuth) return null
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    return { uid: decoded.uid, email: decoded.email }
  } catch {
    return null
  }
}

// Creates a Stripe Connect account if missing and returns an onboarding link
export async function POST(request: Request) {
  const auth = await getUidFromCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!adminDb) {
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const refreshUrl = searchParams.get('refresh_url') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const returnUrl = searchParams.get('return_url') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  try {
    const userRef = adminDb.collection('users').doc(auth.uid)
    const snap = await userRef.get()
    let accountId = snap.exists ? (snap.data()?.stripeAccountId as string | undefined) : undefined

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: auth.email || undefined,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: 'individual',
      })
      accountId = account.id
      await userRef.set({ stripeAccountId: accountId }, { merge: true })
    }

    const link = await stripe.accountLinks.create({
      account: accountId!,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: link.url })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create onboarding link' }, { status: 500 })
  }
}