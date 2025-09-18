import { db } from "@/lib/firebase";
import { Billboards } from "@/types-db";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: { billboardId : string}}
) => {
    try {
        if (!adminAuth) {
          return new NextResponse("Firebase admin not initialized", {status: 500});
        }

        const cookieStore = cookies()
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
    
        const {label, imageUrl} = body;
    
    
        if(!label){
            return new NextResponse("Billboard Name Missing", {status: 400})
        }
        if(!imageUrl){
            return new NextResponse("Billboard Image Missing", {status: 400})
        }


        if(!params.billboardId){
            return new NextResponse("No Billboard selected", {status: 400})
        }

        const store = await getDoc(doc(db, "data"))

        if(store.exists()){
            let storeData = store.data()
            if(storeData?.userId !== userId){
                return new NextResponse("Unauthorized Access", {status: 500})
            }
        }

     const billboardRef = await getDoc(
        doc(db, "data", "billboards", params.billboardId)
     )

     if(billboardRef.exists()){
        await updateDoc(
            doc(db, "data", "wModRJCDon6XLQYmnuPT", "billboards", params.billboardId), {
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
            doc(db, "data", "wModRJCDon6XLQYmnuPT", "billboards", params.billboardId)
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
    {params} : {params: { billboardId : string}}
) => {
    try {
        if (!adminAuth) {
          return new NextResponse("Firebase admin not initialized", {status: 500});
        }

        const cookieStore = cookies()
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
    
        if(!params.billboardId){
            return new NextResponse("No Billboard selected", {status: 400})
        }



     const billboardRef = doc(db, "data", "wModRJCDon6XLQYmnuPT", "billboards", params.billboardId);

     await deleteDoc(billboardRef);



    return NextResponse.json({msg: "Billboard Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`STORES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};
