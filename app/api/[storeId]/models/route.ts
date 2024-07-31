import { db } from "@/lib/firebase";
import {  Category, Model } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const POST = async (reQ: Request,
    {params} : {params: {storeId: string}}
) => {
    try {
        const {userId} = auth()
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

        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))

        if(store.exists()){
            let storeData = store.data()
            if(storeData?.userId !== userId){
                return new NextResponse("Unauthorized Access", {status: 500})
            }
        }

        const ModelData = {
            name,
            brandId,
            brandLabel,
            createdAt: serverTimestamp()
        }

        const ModelRef = await addDoc(
            collection(db,"stores", params.storeId, "models"),
            ModelData
        );

        const id = ModelRef.id;

        await updateDoc(doc(db, "stores", params.storeId, "models", id), 
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
    {params} : {params: {storeId: string}}
) => {
    try {

        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        const modelData = (
            await getDocs(
                collection(doc(db, "stores", params.storeId), "models")
            )
        ).docs.map(doc => doc.data()) as Model[];

        return NextResponse.json(modelData)
    
    
    }
   

 catch (error) {
    console.log(`MODELS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


