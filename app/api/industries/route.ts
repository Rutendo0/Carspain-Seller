import { db } from "@/lib/firebase";
import {  Industry } from "@/types-db";
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
    
        const {name, value} = body;
    
    
        if(!name){
            return new NextResponse("Category Name Missing", {status: 400})
        }
        if(!value){
            return new NextResponse("Industry definition Missing", {status: 400})
        }

        const IndustryData = {
            name,
            value,
            createdAt: serverTimestamp()
        }

        const IndustryRef = await addDoc(
            collection(db,"data", "wModRJCDon6XLQYmnuPT", "industries"),
            IndustryData
        );

        const id = IndustryRef.id;
        await updateDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT", "industries", id), 
        {...IndustryData,
            id,
            updatedAt: serverTimestamp()
        }
    );

    return NextResponse.json({id, ...IndustryData})
    
    
    }
   

 catch (error) {
    console.log(`INDUSTRIES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


export const GET = async (reQ: Request,
) => {
    try {


        const categoryData = (
            await getDocs(
                collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "industries")
            )
        ).docs.map(doc => doc.data()) as Industry[];

        return NextResponse.json(categoryData)
    
    
    }
   

 catch (error) {
    console.log(`INDUSTRIES_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};



export const runtime = 'nodejs';
