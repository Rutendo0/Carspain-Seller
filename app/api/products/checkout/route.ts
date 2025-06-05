import {Stripe} from "stripe"
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/firebase"
import { Product, Store } from "@/types-db"
import {
    addDoc,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore"
import axios from "axios";



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
    const {                        
        products,
        userID,
        clientName,
        clientEmail,
        method,
        address,
        lat,
        lng,
        baddress,
        number,
        deliveryInstructions,
        deliveryCost,
        deliveryDate,
        total
    } = await req.json();


    if(method == 'cash'){
        console.log("cash-------------------");


    
        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);
    
        for (const storeId of storeIds) {
            
    
    
            let holder : Product[] = [];
            let name = '';
            let storeaddress = '';
            let totalNew = deliveryCost;
    
            // Step 2: Iterate through each store to find the product
            for (const product of products) {
                const productDoc = await getDoc(doc(db, "stores", storeId, "products", product.id));
                const nameDoc = await getDoc(doc(db, "stores", storeId));
                if(nameDoc.exists()){
                    const store = nameDoc.data() as Store
                    name = store.name
                    storeaddress = store.address
                }
                if (productDoc.exists()) {
                    if(product.stock >= product.qty){
                        const value = product.stock - product.qty
                        await updateDoc(doc(db, "stores", storeId, "products", product.id), 
                        {
                            ...product,
                            stock: value,
                            updatedAt: serverTimestamp(),
                        });

                    }
                    holder.push(product);
                    totalNew += product.price
                }
            }
            if(holder.length > 0){
                console.log(holder);
            
                const orderData = {
                    isPaid: false,
                    orderItems: holder,
                    userID: userID,
                    address: address,
                    baddress: baddress,
                    lat: lat,
                    lng: lng,
                    number: number,
                    clientName: clientName,
                    clientEmail: clientEmail,
                    deliveryInstructions: deliveryInstructions,
                    deliveryDate: deliveryDate,
                    sumTotal: totalNew,
                    store_id: storeId,
                    store_name: name,
                    store_address: storeaddress || '', // Fallback to empty string if undefined
                    approved: "Pending",
                    order_status: "Processing",
                    createdAt: serverTimestamp(),
                }
        
                const orderRef = await addDoc(
                    collection(db, "stores", storeId, "orders"),
                    orderData
                );
                const id = orderRef.id;
        
                await updateDoc(doc(db, "stores", storeId, "orders", id), 
                {
                    ...orderData,
                    id,
                    updatedAt: serverTimestamp(),
                });



                
            }
    

    
        }
    
    
    
    
        return NextResponse.json(products,{headers: corsHeaders})

    }
    else{
        console.log("curency");
        const line_items : Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    


    
        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);
    
        for (const storeId of storeIds) {
            
    
    
            let holder : Product[] = [];
            let name = '';
            let storeaddress = '';
    
            // Step 2: Iterate through each store to find the product
            for (const product of products) {
                const productDoc = await getDoc(doc(db, "stores", storeId, "products", product.id));
                const nameDoc = await getDoc(doc(db, "stores", storeId));
                if(nameDoc.exists()){
                    const store = nameDoc.data() as Store
                    name = store.name
                    storeaddress = store.address
                }
                if (productDoc.exists()) {
                    if(product.stock >= product.qty){
                        const value = product.stock - product.qty
                        await updateDoc(doc(db, "stores", storeId, "products", product.id), 
                        {
                            ...product,
                            stock: value,
                            updatedAt: serverTimestamp(),
                        });

                    }
                    holder.push(product);
                }
            }
    


            if(holder.length > 0){
                console.log(holder);
                const orderData = {
                    isPaid: false,
                    orderItems: holder,
                    userID: userID,
                    address: address,
                    baddress: baddress,
                    number: number,
                    clientName: clientName,
                    clientEmail: clientEmail,
                    deliveryInstructions: deliveryInstructions,
                    sumTotal: total,
                    store_id: storeId,
                    store_name: name,
                    order_status: "Processing",
                    approved: "Pending",
                    createdAt: serverTimestamp(),
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
                console.log(line_items)
                    
                await updateDoc(doc(db, "stores", storeId, "orders", id), 
                {
                    ...orderData,
                    id,
                    updatedAt: serverTimestamp(),
                });
    
            }



            await axios.post('https://example.com/api', 
                { dataKey: 'dataValue' }, // Request body (data)
                {
                  headers: {
                    'signature': 'Bearer your_token',
                    'x-api-key': 'application/json'
                  },
                  params: {
                    queryParam1: 'value1',
                    queryParam2: 'value2'
                  }
                }
              );
              
    



    
    
    
        }
    

    
    
    
        return NextResponse.json(products, {headers: corsHeaders})
    }
    return NextResponse.json(products,{headers: corsHeaders})
};
//Each order must be set individually. The route must receive a list of products, and subsequently go through each product to 
// identify which store it belongs to. This storeId is then used with the above process as we know how.
