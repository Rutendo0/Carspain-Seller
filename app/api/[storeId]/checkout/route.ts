import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/firebase"
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore"
import { z } from "zod"

// Limit CORS to your storefront origin
const ALLOWED_ORIGIN = process.env.FRONTEND_STORE_URL || "http://localhost:3000"
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  Vary: "Origin",
}

export const OPTIONS = async () => {
  return NextResponse.json({}, { headers: corsHeaders })
}

const BodySchema = z.object({
  // Preferred shape
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        qty: z.number().int().positive().max(100),
      })
    )
    .min(1)
    .optional(),
  // Back-compat shape
  products: z
    .array(
      z.object({
        id: z.string().min(1),
        qty: z.number().int().positive().max(100),
      })
    )
    .min(1)
    .optional(),
  userId: z.string().optional(),
})

export const POST = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    const json = await req.json().catch(() => null)
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: corsHeaders })
    }

    const payload = parsed.data
    const rawItems = (payload.items ?? payload.products) || []

    // Fetch server-trusted product data and build line items securely
    const orderItems: { id: string; name: string; price: number; qty: number }[] = []

    for (const { id, qty } of rawItems) {
      const pSnap = await getDoc(doc(db, "stores", params.storeId, "products", id))
      if (!pSnap.exists()) {
        return NextResponse.json({ error: `Product not found: ${id}` }, { status: 404, headers: corsHeaders })
      }
      const p = pSnap.data() as { name: string; price: number }
      // Trust price/name only from DB (never from client)
      orderItems.push({ id, name: p.name, price: p.price, qty })
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400, headers: corsHeaders })
    }

    // Create order in Firestore
    const order = {
      isPaid: false,
      orderItems,
      userId: payload.userId || null,
      order_status: "Processing" as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const orderRef = await addDoc(collection(db, "stores", params.storeId, "orders"), order)
    const orderId = orderRef.id

    // Build Stripe line items from server values
    const line_items = orderItems.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: "USD",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
    }))

    const successUrl = `${ALLOWED_ORIGIN}/cart?success=1`
    const cancelUrl = `${ALLOWED_ORIGIN}/cart?canceled=1`

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["ZW", "ZA", "ZM"] },
      phone_number_collection: { enabled: true },
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: orderId,
        storeId: params.storeId,
      },
    })

    // Keep a pointer to session id/url if you want
    await updateDoc(doc(db, "stores", params.storeId, "orders", orderId), {
      stripeSessionId: session.id,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({ url: session.url }, { headers: corsHeaders })
  } catch (err) {
    console.error("Checkout error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders })
  }
}