import { db } from "@/lib/firebase";
import {  Order } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";


export const GET = async (reQ: Request,
    {params} : {params: {storeId : string}}
) => {
    try {



        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);

        // Step 2: Fetch orders for each store
        let allOrders : Order[] = [];
        const ordersQuery = query(
            collection(doc(db, "stores", params.storeId), "orders")
        );



        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);
        allOrders = allOrders.concat(orders);
    


        return NextResponse.json(allOrders)
    
    
    }
   

 catch (error) {
    console.log(`ORDERS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


