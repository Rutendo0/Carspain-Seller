import { db } from "@/lib/firebase";
import {  Category, Review } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";



const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export const OPTIONS = async () => {
    return NextResponse.json({}, {headers: corsHeaders})
}

export const POST = async (reQ: Request, {params} : {params: { productId : string}}
) => {
    try {

        const body = await reQ.json()
    

    
        const {name, comment, userId} = body;
        if(!userId || userId == ''){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
        if(!name || name == ''){
            return new NextResponse("Incomplete", {status: 400})
        }

        if(!comment || comment == ''){
            return new NextResponse("Incomplete", {status: 400})
        }



        const ReviewData = {
            userName: name,
            comment,
            userId,
            productID: params.productId,
            createdAt: serverTimestamp()
        }


        const ReviewRef = await addDoc(
            collection(db,"data", "wModRJCDon6XLQYmnuPT", "reviews"),
            ReviewData
        );

        const id = ReviewRef.id;

        await updateDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT", "reviews", id), 
        {...ReviewData,
            id,
            updatedAt: serverTimestamp()
        }
    );

    return NextResponse.json({id, ...ReviewData},{headers: corsHeaders})
    
    
    }
   

 catch (error) {
    console.log(`CATEGORIES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


export const GET = async (reQ: Request, {params} : {params: { productId : string}}
) => {
    try {

        const categoryData = (
            await getDocs(
                query(
                collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "reviews"),
                where("productID", "==", params.productId))
            )
        ).docs.map(doc => doc.data()) as Review[];

        return NextResponse.json(categoryData)
    
    
    }
   

 catch (error) {
    console.log(`CATEGORIESS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


