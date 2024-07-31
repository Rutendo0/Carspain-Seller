import { db } from "@/lib/firebase";
import { Billboards } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: {storeId: string, billboardId : string}}
) => {
    try {
        const {userId} = auth()
        const body = await reQ.json()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
        const {label, imageUrl} = body;
    
    
        if(!label){
            return new NextResponse("Billboard Name Missing", {status: 400})
        }
        if(!imageUrl){
            return new NextResponse("Billboard Image Missing", {status: 400})
        }

        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!params.billboardId){
            return new NextResponse("No Billboard selected", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))

        if(store.exists()){
            let storeData = store.data()
            if(storeData?.userId !== userId){
                return new NextResponse("Unauthorized Access", {status: 500})
            }
        }

     const billboardRef = await getDoc(
        doc(db, "stores", params.storeId, "billboards", params.billboardId)
     )

     if(billboardRef.exists()){
        await updateDoc(
            doc(db, "stores", params.storeId, "billboards", params.billboardId), {
                ...billboardRef.data(),
                label,
                imageUrl,
                updatedAt: serverTimestamp(),
            }
        )
     }else{
        return new NextResponse("Billboard not found!", {status: 404})
     }

     const billboard = (
        await getDoc(
            doc(db, "stores", params.storeId, "billboards", params.billboardId)
        )
     ).data() as Billboards


    return NextResponse.json(billboard);
    
    
    }
   

 catch (error) {
    console.log(`STORES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};




export const DELETE = async (reQ: Request,
    {params} : {params: {storeId: string, billboardId : string}}
) => {
    try {
        const {userId} = auth()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    


        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!params.billboardId){
            return new NextResponse("No Billboard selected", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))

        if(store.exists()){
            let storeData = store.data()
            if(storeData?.userId !== userId){
                return new NextResponse("Unauthorized Access", {status: 500})
            }
        }

     const billboardRef = doc(db, "stores", params.storeId, "billboards", params.billboardId)

     await deleteDoc(billboardRef);



    return NextResponse.json({msg: "Billboard Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`STORES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};
