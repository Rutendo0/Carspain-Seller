import { db } from "@/lib/firebase";
import {  Brand } from "@/types-db";
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
    
        const {name} = body;
    
    
        if(!name){
            return new NextResponse("Brand Name Missing", {status: 400})
        }



        const BrandData = {
            name,
            createdAt: serverTimestamp()
        }

        const BrandRef = await addDoc(
            collection(db,"data","wModRJCDon6XLQYmnuPT", "brands"),
            BrandData
        );

        const id = BrandRef.id;


        await updateDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT", "brands", id), 
        {...BrandData,
            id,
            updatedAt: serverTimestamp()
        }
    );

    return NextResponse.json({id, ...BrandData})
    
    
    }
   

 catch (error) {
    console.log(`BRANDS_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


export const GET = async (reQ: Request,
) => {
    try {

        const BrandData = (
            await getDocs(
                collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "brands")
            )
        ).docs.map(doc => doc.data()) as Brand[];

        return NextResponse.json(BrandData)
    
    
    }
   

 catch (error) {
    console.log(`brands_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


