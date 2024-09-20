import { db } from "@/lib/firebase";
import {  Industry } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: { industryId : string}}
) => {
    try {
        const {userId} = auth()
        const body = await reQ.json()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
        const {name, value} = body;
    
    
        if(!name){
            return new NextResponse("Industry Name Missing", {status: 400})
        }
        if(!value){
            return new NextResponse("Industry definition Missing", {status: 400})
        }


        if(!params.industryId){
            return new NextResponse("No Industry specified", {status: 400})
        }


     const industryRef = await getDoc(
        doc(db, "data", "wModRJCDon6XLQYmnuPT", "industries", params.industryId)
     )

     if(industryRef.exists()){
        await updateDoc(
            doc(db, "data", "industries", params.industryId), {
                ...industryRef.data(),
                name,
                value,
                updatedAt: serverTimestamp(),
            }
        )
     }
     else{
        return new NextResponse("Industry not found!", {status: 404})
     }

     const industry = (
        await getDoc(
            doc(db, "data", "wModRJCDon6XLQYmnuPT", "industries", params.industryId)
        )
     ).data() as Industry;


    return NextResponse.json(industry);
    
    
    }
   

 catch (error) {
    console.log(`INDUSTRY_PATCH:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};




export const DELETE = async (reQ: Request,
    {params} : {params: { industryId : string}}
) => {
    try {
        const {userId} = auth()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    

        if(!params.industryId){
            return new NextResponse("No industry selected", {status: 400})
        }


     const industryRef = doc(db, "data", "wModRJCDon6XLQYmnuPT", "industries", params.industryId)

     await deleteDoc(industryRef);



    return NextResponse.json({msg: "industry Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`industry_DELETE:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};
