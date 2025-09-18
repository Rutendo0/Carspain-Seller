import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const runtime = 'nodejs'

// Optional: restrict origin for preflight (Stripe sends no origin, so not strictly needed)
export const OPTIONS = async () => NextResponse.json({}, { status: 200 })

export const POST = async (req: Request) => {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string | null

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("Webhook signature verification failed", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const orderId = session.metadata?.orderId
    const storeId = session.metadata?.storeId

    if (!orderId || !storeId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    try {
      await updateDoc(doc(db, "stores", storeId, "orders", orderId), {
        isPaid: true,
        address: [
          session.customer_details?.address?.line1 ?? undefined,
          session.customer_details?.address?.line2 ?? undefined,
          session.customer_details?.address?.city ?? undefined,
          session.customer_details?.address?.state ?? undefined,
          session.customer_details?.address?.postal_code ?? undefined,
          session.customer_details?.address?.country ?? undefined,
        ]
          .filter(Boolean)
          .join(", "),
        number: session.customer_details?.phone ?? null,
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error("Failed to update order on webhook", e)
      return NextResponse.json({ error: "Order update failed" }, { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}