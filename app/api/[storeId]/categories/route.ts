import { db } from "@/lib/firebase";
import {  Category } from "@/types-db";
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
    
        const {name, billboardLabel, billboardId} = body;
    
    
        if(!name){
            return new NextResponse("Category Name Missing", {status: 400})
        }
        if(!billboardId){
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

        const CategoryData = {
            name,
            billboardId,
            billboardLabel,
            createdAt: serverTimestamp()
        }

        const CategoryRef = await addDoc(
            collection(db,"stores", params.storeId, "categories"),
            CategoryData
        );

        const id = CategoryRef.id;
        console.log(id)
        console.log("--------------IDEXISTS______________")
        await updateDoc(doc(db, "stores", params.storeId, "categories", id), 
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
    {params} : {params: {storeId: string}}
) => {
    try {

        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        const categoryData = (
            await getDocs(
                collection(doc(db, "stores", params.storeId), "categories")
            )
        ).docs.map(doc => doc.data()) as Category[];

        return NextResponse.json(categoryData)
    
    
    }
   

 catch (error) {
    console.log(`CATEGORIESS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


