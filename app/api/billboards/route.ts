import { db } from "@/lib/firebase";
import { Billboards } from "@/types-db";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const POST = async (reQ: Request,
    
) => {
    try {
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


        const billboardData = {
            label,
            imageUrl,
            createdAt: serverTimestamp()
        }

        const billboardRef = await addDoc(
            collection(db,"data", "wModRJCDon6XLQYmnuPT",  "billboards"),
            billboardData
        );

        const id = billboardRef.id;

        await updateDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT", "billboards", id), 
        {...billboardData,
            id,
            updatedAt: serverTimestamp()
        }
    );

    return NextResponse.json({id, ...billboardData})
    
    
    }
   

 catch (error) {
    console.log(`STORES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


export const GET = async (reQ: Request
) => {
    try {

        const billboardData = (
            await getDocs(
                collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "billboards")
            )
        ).docs.map(doc => doc.data()) as Billboards[];

        return NextResponse.json(billboardData)
    
    
    }
   

 catch (error) {
    console.log(`STORES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


