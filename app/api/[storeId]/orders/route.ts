import { db } from "@/lib/firebase";
import {  Order } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";


export const GET = async (reQ: Request,
    {params} : {params: {storeId: string}}
) => {
    try {

        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        const orderData = (
            await getDocs(
                collection(doc(db, "stores", params.storeId), "orders")
            )
        ).docs.map(doc => doc.data()) as Order[];


        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);

        // Step 2: Fetch orders for each store
        let allOrders : Order[][] = [];
        for (const storeId of storeIds) {
            const ordersSnapshot = await getDocs(collection(doc(db, "stores", storeId), "orders"));
            const orders = ordersSnapshot.docs.map(doc => doc.data() as Order[]);
            allOrders = allOrders.concat(orders);
        }


        return NextResponse.json(allOrders)
    
    
    }
   

 catch (error) {
    console.log(`ORDERS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


