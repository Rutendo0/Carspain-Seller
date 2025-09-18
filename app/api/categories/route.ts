import { db } from "@/lib/firebase";
import {  Category } from "@/types-db";
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
          if (!adminAuth) {
            return new NextResponse("Firebase Admin not initialized", {status: 500})
          }
          const decodedToken = await adminAuth.verifyIdToken(token)
          userId = decodedToken.uid
        } catch (error) {
          return new NextResponse("Unauthorized", {status: 401})
        }

        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }

        const body = await reQ.json()
    
        const {name, billboardLabel, billboardId} = body;
    
    
        if(!name){
            return new NextResponse("Category Name Missing", {status: 400})
        }
        if(!billboardId){
            return new NextResponse("Billboard Image Missing", {status: 400})
        }

        const CategoryData = {
            name,
            billboardId,
            billboardLabel,
            createdAt: serverTimestamp()
        }

        const CategoryRef = await addDoc(
            collection(db,"data", "wModRJCDon6XLQYmnuPT", "categories"),
            CategoryData
        );

        const id = CategoryRef.id;

        await updateDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT", "categories", id), 
        {...CategoryData,
            id,
            updatedAt: serverTimestamp()
        }
    );

    return NextResponse.json({id, ...CategoryData})
    
    
    }
   

 catch (error) {
    console.log(`CATEGORIES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


export const GET = async (reQ: Request,
) => {
    try {

        const categoryData = (
            await getDocs(
                collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "categories")
            )
        ).docs.map(doc => doc.data()) as Category[];

        return NextResponse.json(categoryData)
    
    
    }
   

 catch (error) {
    console.log(`CATEGORIESS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};



export const runtime = 'nodejs';
