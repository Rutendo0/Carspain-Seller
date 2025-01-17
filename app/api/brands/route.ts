import { db } from "@/lib/firebase";
import {  Brand } from "@/types-db";
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
    
        const {name} = body;
    
    
        if(!name){
            return new NextResponse("Brand Name Missing", {status: 400})
        }



        const BrandData = {
            name,
            createdAt: serverTimestamp()
        }

        const BrandRef = await addDoc(
            collection(db,"data","wModRJCDon6XLQYmnuPT", "brands"),
            BrandData
        );

        const id = BrandRef.id;


        await updateDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT", "brands", id), 
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
) => {
    try {

        const BrandData = (
            await getDocs(
                collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "brands")
            )
        ).docs.map(doc => doc.data()) as Brand[];

        return NextResponse.json(BrandData)
    
    
    }
   

 catch (error) {
    console.log(`brands_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


