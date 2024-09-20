import {Stripe} from "stripe"

import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/firebase"
import { Product, Store } from "@/types-db"
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
    req: Request
) => {
    const {products, userId, method} = await req.json();
    if(method == 'cash'){
        console.log("cash");
    
        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);
    
        for (const storeId of storeIds) {
            
    
    
            let holder : Product[] = [];
    
            // Step 2: Iterate through each store to find the product
            for (const product of products) {
                const productDoc = await getDoc(doc(db, "stores", storeId, "products", product.id));
                if (productDoc.exists()) {
                    holder.push(product);
                }
            }

            if(holder.length > 0){
                const sn = (await getDoc(doc(db, "stores", storeId))).data() as Store;
                const storeNmae = sn.name;
        
                const orderData = {
                    store_name: storeNmae,
                    store_id: storeId,
                    isPaid: false,
                    orderItems: holder,
                    userId,
                    order_status: "Processing",
                    createdAt: serverTimestamp(),
                    method: "cash"
                }
        
                const orderRef = await addDoc(
                    collection(db, "stores", storeId, "orders"),
                    orderData
                )
                const id = orderRef.id;
        
                await updateDoc(doc(db, "stores", storeId, "orders", id), 
                {
                    ...orderData,
                    id,
                    updatedAt: serverTimestamp(),
                });
            }


    
        }
    
    
    
    
        return NextResponse.json('success')

    }
    else{
        console.log("curency");
        const line_items : Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    


    
        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);
    
        for (const storeId of storeIds) {
            
    
    
            let holder : Product[] = [];
    
            // Step 2: Iterate through each store to find the product
            for (const product of products) {
                const productDoc = await getDoc(doc(db, "stores", storeId, "products", product.id));
                if (productDoc.exists()) {
                    holder.push(product);
                }
            }
    
            const orderData = {
                isPaid: false,
                orderItems: holder,
                userId,
                order_status: "Processing",
                createdAt: serverTimestamp(),
                method: "card"
            }
    
            const orderRef = await addDoc(
                collection(db, "stores", storeId, "orders"),
                orderData
            )
            const id = orderRef.id;
    
            holder.forEach((item: Product) => {
                line_items.push({
                    quantity: item.qty,
                    price_data : {
                        currency: "USD",
                        product_data: {
                            name: item.name,
                            metadata: {
                                store_id: storeId,
                                order_id: id,
                            },
                        },
                        unit_amount : Math.round(item.price * 100),
                    }
                });
            });
    
            await updateDoc(doc(db, "stores", storeId, "orders", id), 
            {
                ...orderData,
                id,
                updatedAt: serverTimestamp(),
            });
    
    
    
    
        }
    
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
        })
    
    
    
    
        return NextResponse.json({url: session.url}, {headers: corsHeaders})

    }

};
//Each order must be set individually. The route must receive a list of products, and subsequently go through each product to 
// identify which store it belongs to. This storeId is then used with the above process as we know how.