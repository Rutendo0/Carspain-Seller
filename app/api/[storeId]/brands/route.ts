import { db } from "@/lib/firebase";
import {  Brand } from "@/types-db";
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
    
        const {name} = body;
    
    
        if(!name){
            return new NextResponse("Brand Name Missing", {status: 400})
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

        const BrandData = {
            name,
            createdAt: serverTimestamp()
        }

        const BrandRef = await addDoc(
            collection(db,"stores", params.storeId, "brands"),
            BrandData
        );

        const id = BrandRef.id;


        await updateDoc(doc(db, "stores", params.storeId, "brands", id), 
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
    {params} : {params: {storeId: string}}
) => {
    try {

        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        const BrandData = (
            await getDocs(
                collection(doc(db, "stores", params.storeId), "brands")
            )
        ).docs.map(doc => doc.data()) as Brand[];

        return NextResponse.json(BrandData)
    
    
    }
   

 catch (error) {
    console.log(`brands_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


