import { db } from "@/lib/firebase";
import {  Category } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const POST = async (reQ: Request,
) => {
    try {
        const {userId} = auth()
        const body = await reQ.json()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
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


