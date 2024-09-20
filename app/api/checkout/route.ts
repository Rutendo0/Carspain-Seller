import {Stripe} from "stripe"

import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/firebase"
import { Product } from "@/types-db"
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore"
import { url } from "inspector"

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export const OPTIONS = async () => {
    return NextResponse.json({}, {headers: corsHeaders})
}

export const POST = async (
    req: Request,
    {params}: {params: {storeId: string}}
) => {
    const {products, userId} = await req.json();

    const line_items : Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    products.forEach((item: Product) => {
        line_items.push({
            quantity: item.qty,
            price_data : {
                currency: "USD",
                product_data: {
                    name: item.name,
                },
                unit_amount : Math.round(item.price * 100),
            }
        });
    });


    const orderData = {
        isPaid: false,
        orderItems: products,
        userId,
        order_status: "Processing",
        createdAt: serverTimestamp(),
    }


    const orderRef = await addDoc(
        collection(db, "stores", params.storeId, "orders"),
        orderData
    )

    const id = orderRef.id;
    const storesSnapshot = await getDocs(collection(db, "stores"));
    const storeIds = storesSnapshot.docs.map(doc => doc.id);

    for (const product of products) {


        let holder = null;

        // Step 2: Iterate through each store to find the product
        for (const storeId of storeIds) {
            const productDoc = await getDoc(doc(db, "stores", storeId, "products", product.id));
            if (productDoc.exists()) {
                holder = productDoc.data() as Product;
                
                await updateDoc(doc(db, "stores", storeId, "orders", product.id), 
                {
                    ...orderData,
                    id,
                    updatedAt: serverTimestamp(),
                });
            }
        }
    }

    await updateDoc(doc(db, "stores", params.storeId, "orders", id), 
    {
        ...orderData,
        id,
        updatedAt: serverTimestamp(),
    });

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        billing_address_collection: "required",
        shipping_address_collection : {
            allowed_countries: ["ZW", "ZA", "ZM"]
        },
        phone_number_collection : {
            enabled: true,
        },
        success_url : `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceld=1`,
        metadata : {
            orderId: id,
            storeId : params.storeId,
        }
    })

    return NextResponse.json({url: session.url}, {headers: corsHeaders})
};
//Each order must be set individually. The route must receive a list of products, and subsequently go through each product to 
// identify which store it belongs to. This storeId is then used with the above process as we know how.