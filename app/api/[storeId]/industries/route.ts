import { db } from "@/lib/firebase";
import {  Industry } from "@/types-db";
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
    
        const {name, value} = body;
    
    
        if(!name){
            return new NextResponse("Category Name Missing", {status: 400})
        }
        if(!value){
            return new NextResponse("Industry definition Missing", {status: 400})
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

        const IndustryData = {
            name,
            value,
            createdAt: serverTimestamp()
        }

        const IndustryRef = await addDoc(
            collection(db,"stores", params.storeId, "industries"),
            IndustryData
        );

        const id = IndustryRef.id;
        await updateDoc(doc(db, "stores", params.storeId, "industries", id), 
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
    {params} : {params: {storeId: string}}
) => {
    try {

        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        const categoryData = (
            await getDocs(
                collection(doc(db, "stores", params.storeId), "industries")
            )
        ).docs.map(doc => doc.data()) as Industry[];

        return NextResponse.json(categoryData)
    
    
    }
   

 catch (error) {
    console.log(`INDUSTRIES_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


