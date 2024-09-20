import { db } from "@/lib/firebase";
import {  Brand } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: { brandId : string}}
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


        if(!params.brandId){
            return new NextResponse("No Brand specified", {status: 400})
        }


     const brandRef = await getDoc(
        doc(db, "data", "brands", params.brandId)
     )

     if(brandRef.exists()){
        await updateDoc(
            doc(db, "data", "brands", params.brandId), {
                ...brandRef.data(),
                name,
                updatedAt: serverTimestamp(),
            }
        )
     }else{
        return new NextResponse("brand not found!", {status: 404})
     }

     const brand = (
        await getDoc(
            doc(db, "data", "brands", params.brandId)
        )
     ).data() as Brand;


    return NextResponse.json(brand);
    
    
    }
   

 catch (error) {
    console.log(`INDUSTRY_PATCH:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};




export const DELETE = async (reQ: Request,
    {params} : {params: { brandId : string}}
) => {
    try {
        const {userId} = auth()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }

        if(!params.brandId){
            return new NextResponse("No brand selected", {status: 400})
        }

     const brandRef = doc(db, "data", "brands", params.brandId)

     await deleteDoc(brandRef);



    return NextResponse.json({msg: "brand Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`brands_DELETE:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};
