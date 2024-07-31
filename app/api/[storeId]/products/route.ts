import { db } from "@/lib/firebase";
import {  Industry, Product } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, and, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
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
    
        const {name,
            price,
            OEM,
            images,
            isFeatured,
            isArchived,
            category,
            industry,
            brand,
            model,
            year
        } = body;
    
    
        if(!name){
            return new NextResponse("Category Name Missing", {status: 400})
        }
        if(!images || !images.length){
            return new NextResponse("Images missing Missing", {status: 400})
        }

        if(!price){
            return new NextResponse("No price specified", {status: 400})
        }
        if(!category){
            return new NextResponse("No category selected", {status: 400})
        }

        if(!OEM){
            return new NextResponse("No OEM specified", {status: 400})
        }

        if(!year){
            return new NextResponse("No year specified", {status: 400})
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



        const ProductsData = {
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
            createdAt: serverTimestamp()
        }

        console.log(ProductsData);

        const ProductsRef = await addDoc(
            collection(db,"stores", params.storeId, "products"),
            ProductsData
        );

        const id = ProductsRef.id;
        await updateDoc(doc(db, "stores", params.storeId, "products", id), 
        {...ProductsData,
            id,
            updatedAt: serverTimestamp()
        }
    );

    return NextResponse.json({id, ...ProductsData})
    
    
    }
   

 catch (error) {
    console.log(`PRODUCTS_POST:${error}`);
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

        //get search params from the url
        const {searchParams} = new URL(reQ.url)

        const productRef = collection(doc(db, "stores", params.storeId), "products");

        let productQuery;

        let queryConstraints = []

        //construct query
        if(searchParams.has("industry")){
            queryConstraints.push(where("industry", "==", searchParams.get("industry")))
        }
        if(searchParams.has("category")){
            queryConstraints.push(where("category", "==", searchParams.get("category")))
        }
        if(searchParams.has("brand")){
            queryConstraints.push(where("brand", "==", searchParams.get("brand")))
        }
        if(searchParams.has("model")){
            queryConstraints.push(where("model", "==", searchParams.get("model")))
        }
        if(searchParams.has("isFeatured")){
            queryConstraints.push(where("isFeatured", "==",
                 searchParams.get("isFeatured") === "true" ? true : false))
        }

        if(searchParams.has("isArchived")){
            queryConstraints.push(where("isArchived", "==",
                 searchParams.get("isArchived") === "true" ? true : false))
        }

        if(queryConstraints.length > 0){
            productQuery = query(productRef, and(...queryConstraints))
        }else{
            productQuery = query(productRef);
        }

        const querySnapshot = await getDocs(productQuery)

        const productData : Product[] = querySnapshot.docs.map(doc => doc.data() as Product);

        return NextResponse.json(productData);
    
    
    }
   

 catch (error) {
    console.log(`PRODUCTS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


