import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase";
import { Phone } from "lucide-react";

export const POST = async (req: Request) => {
    const body = await req.text();

    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        
    } catch (error) {
        return new NextResponse("Error")
    }

    const session = event.data.object as Stripe.Checkout.Session;

    const address = session?.customer_details?.address;

    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country,
    ];

    const addressString = addressComponents.filter((a) => a !== null).join(", ")

    if (event.type === "checkout.session.completed") {

        if (session) {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
                expand: ['data.price.product'],
            });

            // Iterate through each line item
            for (const item of lineItems.data) {
                const storeId = item.price?.product.metadata.store_id;
                const orderId = item.price?.product.metadata.order_id;
                console.log(session)


                if (storeId && orderId) {
                    const storeRef = doc(db, "stores", storeId, "orders", orderId);
                    await updateDoc(storeRef, {
                        isPaid: true,
                        address: `${session.customer_details?.address?.line1}, ${session.customer_details?.address?.line2}, ${session.customer_details?.address?.city}`,
                        phone: session.customer_details?.phone,
                        updatedAt: serverTimestamp(),
                    });
                } else {
                    console.error("Missing store ID or order ID in line item metadata.");
                }
            }
        }
    }
    

    return new NextResponse(null, {status: 200})

}

//Products should be paid for at once, but respective orders sent to individual stores. 