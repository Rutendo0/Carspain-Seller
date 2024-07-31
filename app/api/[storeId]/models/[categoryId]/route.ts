import { db } from "@/lib/firebase";
import { Billboards, Category, Model } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: {storeId: string, modelId : string}}
) => {
    try {
        const {userId} = auth()
        const body = await reQ.json()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
        const {name, brandLabel, brandId} = body;
    
    
        if(!name){
            return new NextResponse("Model Name Missing", {status: 400})
        }
        if(!brandId){
            return new NextResponse("brand Image Missing", {status: 400})
        }

        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!params.modelId){
            return new NextResponse("No model selected", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))

        if(store.exists()){
            let storeData = store.data()
            if(storeData?.userId !== userId){
                return new NextResponse("Unauthorized Access", {status: 500})
            }
        }

     const modelRef = await getDoc(
        doc(db, "stores", params.storeId, "models", params.modelId)
     )

     if(modelRef.exists()){
        await updateDoc(
            doc(db, "stores", params.storeId, "models", params.modelId), {
                ...modelRef.data(),
                name,
                brandId,
                brandLabel,
                updatedAt: serverTimestamp(),
            }
        )
     }else{
        return new NextResponse("Model not found!", {status: 404})
     }

     const model = (
        await getDoc(
            doc(db, "stores", params.storeId, "models", params.modelId)
        )
     ).data() as Model;


    return NextResponse.json(model);
    
    
    }
   

 catch (error) {
    console.log(`Model_PATCH:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};




export const DELETE = async (reQ: Request,
    {params} : {params: {storeId: string, modelId : string}}
) => {
    try {
        const {userId} = auth()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    


        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!params.modelId){
            return new NextResponse("No model selected", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))

        if(store.exists()){
            let storeData = store.data()
            if(storeData?.userId !== userId){
                return new NextResponse("Unauthorized Access", {status: 500})
            }
        }

     const modelRef = doc(db, "stores", params.storeId, "models", params.modelId)

     await deleteDoc(modelRef);



    return NextResponse.json({msg: "model Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`MODEL_DELETE:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};
