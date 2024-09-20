import { db } from "@/lib/firebase";
import { Billboards } from "@/types-db";
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
    
        const {label, imageUrl} = body;
    
    
        if(!label){
            return new NextResponse("Billboard Name Missing", {status: 400})
        }
        if(!imageUrl){
            return new NextResponse("Billboard Image Missing", {status: 400})
        }


        const billboardData = {
            label,
            imageUrl,
            createdAt: serverTimestamp()
        }

        const billboardRef = await addDoc(
            collection(db,"data", "wModRJCDon6XLQYmnuPT",  "billboards"),
            billboardData
        );

        const id = billboardRef.id;

        await updateDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT", "billboards", id), 
        {...billboardData,
            id,
            updatedAt: serverTimestamp()
        }
    );

    return NextResponse.json({id, ...billboardData})
    
    
    }
   

 catch (error) {
    console.log(`STORES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


export const GET = async (reQ: Request
) => {
    try {

        const billboardData = (
            await getDocs(
                collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "billboards")
            )
        ).docs.map(doc => doc.data()) as Billboards[];

        return NextResponse.json(billboardData)
    
    
    }
   

 catch (error) {
    console.log(`STORES_POST:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


