import { db } from "@/lib/firebase";
import {  Order } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: {storeId: string, orderId : string}}
) => {
    try {
        const {userId} = auth()
        const body = await reQ.json()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
        const {order_status} = body;
    
    
        if(!order_status){
            return new NextResponse("Order Gone Missing", {status: 400})
        }


        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!params.orderId){
            return new NextResponse("No order specified", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))

        if(store.exists()){
            let storeData = store.data()

        }

     const orderRef = await getDoc(
        doc(db, "stores", params.storeId, "orders", params.orderId)
     )

     if(orderRef.exists()){
        await updateDoc(
            doc(db, "stores", params.storeId, "orders", params.orderId), {
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
            doc(db, "stores", params.storeId, "orders", params.orderId)
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
    {params} : {params: {storeId: string, orderId : string}}
) => {
    try {
        const {userId} = auth()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    


        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!params.orderId){
            return new NextResponse("No order selected", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))

        if(store.exists()){
            let storeData = store.data()

        }

     const orderRef = doc(db, "stores", params.storeId, "orders", params.orderId)

     await deleteDoc(orderRef);



    return NextResponse.json({msg: "order Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`order_DELETE:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};
