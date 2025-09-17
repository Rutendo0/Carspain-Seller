import { db } from "@/lib/firebase";
import {  Order } from "@/types-db";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: Promise<{storeId: string, orderId : string}>}
) => {
  const { storeId, orderId } = await params;
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('__session')?.value

        if (!token) {
          return new NextResponse("Unauthorized", {status: 401})
        }

        let userId
        try {
          const decodedToken = await adminAuth.verifyIdToken(token)
          userId = decodedToken.uid
        } catch (error) {
          return new NextResponse("Unauthorized", {status: 401})
        }

        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }

        const body = await reQ.json()
    
        const {order_status} = body;
    
    
        if(!order_status){
            return new NextResponse("Order Gone Missing", {status: 400})
        }


        if(!storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!orderId){
            return new NextResponse("No order specified", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", storeId))

        if(store.exists()){
            let storeData = store.data()
            if(storeData?.userId !== userId){
                return new NextResponse("Unauthorized Access", {status: 500})
            }
        }

     const orderRef = await getDoc(
        doc(db, "stores", storeId, "orders", orderId)
     )

     if(orderRef.exists()){
        await updateDoc(
            doc(db, "stores", storeId, "orders", orderId), {
                ...orderRef.data(),
                order_status,
                updatedAt: serverTimestamp(),
            }
        )
     }else{
        return new NextResponse("Order not found!", {status: 404})
     }

     const order = (
        await getDoc(
            doc(db, "stores", storeId, "orders", orderId)
        )
     ).data() as Order;


    return NextResponse.json(order);
    
    
    }
   

 catch (error) {
    console.log(`ORDER_PATCH:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};




export const DELETE = async (reQ: Request,
    {params} : {params: Promise<{storeId: string, orderId : string}>}
) => {
  const { storeId, orderId } = await params;
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('__session')?.value

        if (!token) {
          return new NextResponse("Unauthorized", {status: 401})
        }

        let userId
        try {
          const decodedToken = await adminAuth.verifyIdToken(token)
          userId = decodedToken.uid
        } catch (error) {
          return new NextResponse("Unauthorized", {status: 401})
        }

        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    


        if(!storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!orderId){
            return new NextResponse("No order selected", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", storeId))

        if(store.exists()){
            let storeData = store.data()
            if(storeData?.userId !== userId){
                return new NextResponse("Unauthorized Access", {status: 500})
            }
        }

     const orderRef = doc(db, "stores", storeId, "orders", orderId)

     await deleteDoc(orderRef);



    return NextResponse.json({msg: "order Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`order_DELETE:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};

export const runtime = 'nodejs';
