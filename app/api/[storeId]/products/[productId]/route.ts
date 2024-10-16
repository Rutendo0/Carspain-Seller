import { db, storage } from "@/lib/firebase";
import {  Product } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: {storeId: string, productId : string}}
) => {
    try {
        const {userId} = auth()
        const body = await reQ.json()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
        const {
            name,
            price,
            OEM,
            images,
            isFeatured,
            isArchived,
            category,
            industry,
            brand,
            model,
            year,
        } = body;
    
    
        if(!name){
            return new NextResponse("product Name Missing", {status: 400})
        }
        if(!OEM){
            return new NextResponse("OEM definition Missing", {status: 400})
        }


        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }


        if(!params.productId){
            return new NextResponse("No product specified", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))


        if(store.exists()){
            let storeData = store.data()
        }

     const productRef = await getDoc(
        doc(db, "stores", params.storeId, "products", params.productId)
     )

     if(productRef.exists()){
        await updateDoc(
            doc(db, "stores", params.storeId, "products", params.productId), {
                ...productRef.data(),
                name,
                price,
                OEM,
                images,
                isFeatured,
                isArchived,
                category,
                industry,
                brand,
                model,
                year,
                updatedAt: serverTimestamp(),
            }
        )
     }else{
        return new NextResponse("product not found!", {status: 404})
     }

     const product = (
        await getDoc(doc(db, "stores", params.storeId, "products", params.productId))
     ).data() as Product;


    return NextResponse.json(product);
    
    
    }
   

 catch (error) {
    console.log(`PRODUCT_PATCH:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};




export const DELETE = async (reQ: Request,
    {params} : {params: {storeId: string, productId : string}}
) => {
    try {
        const {userId} = auth()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    


        if(!params.storeId){
            return new NextResponse("No store selected", {status: 400})
        }

        if(!params.productId){
            return new NextResponse("No product selected", {status: 400})
        }

        const store = await getDoc(doc(db, "stores", params.storeId))

        if(store.exists()){
            let storeData = store.data()
        }

     const productRef = doc(db, "stores", params.storeId, "products", params.productId);

     const productDoc = await getDoc(productRef)

     if(!productDoc.exists()){
        return new NextResponse("Product not Found", {status: 404})
     }

     const images = productDoc.data()?.images;
     if(images && Array.isArray(images)){
        await Promise.all(
            images.map(async (image) => {
                const imageRef = ref(storage, image.url);
                await deleteObject(imageRef)
            })
        )
     }

     await deleteDoc(productRef);



    return NextResponse.json({msg: "Product Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`product_DELETE:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};



export const GET = async (reQ: Request,
    {params} : {params: {storeId: string, productId : string}}) => {

        try {
        
        

            if(!params.storeId){
                return new NextResponse("No store selected", {status: 400})
            }
    
            if(!params.productId){
                return new NextResponse("No product specified", {status: 400})
            }

            const product = (
                await getDoc(doc(db, "stores", params.storeId, 
                    "products", params.productId
                ))
            ).data() as Product;
    

    
        
        return NextResponse.json(product);
        
        
        }
       
    
     catch (error) {
        console.log(`PRODUCT_PATCH:${error}`);
        return new NextResponse("Internal Server Error", {status : 500})
    }

};
