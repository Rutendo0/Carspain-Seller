import { db } from "@/lib/firebase";
import {  Category, Model } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const POST = async (reQ: Request
) => {
    try {
        const {userId} = await auth()
        const body = await reQ.json()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
        const {name, brandLabel, brandId} = body;
    
    
        if(!name){
            return new NextResponse("Category Name Missing", {status: 400})
        }
        if(!brandId){
            return new NextResponse("Billboard Image Missing", {status: 400})
        }



        const ModelData = {
            name,
            brandId,
            brandLabel,
            createdAt: serverTimestamp()
        }

        const ModelRef = await addDoc(
            collection(db,"data", "wModRJCDon6XLQYmnuPT", "models"),
            ModelData
        );

        const id = ModelRef.id;

        await updateDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT", "models", id), 
        {...ModelData,
            id,
            updatedAt: serverTimestamp()
        }
    );

    return NextResponse.json({id, ...ModelData})
    
    
    }
   

 catch (error) {
    console.log(`MODELS_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


export const GET = async (reQ: Request,
) => {
    try {

        const modelData = (
            await getDocs(
                collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "models")
            )
        ).docs.map(doc => doc.data()) as Model[];

        return NextResponse.json(modelData)
    
    
    }
   

 catch (error) {
    console.log(`MODELS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};



export const runtime = 'nodejs';
