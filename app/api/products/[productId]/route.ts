import { db, storage } from "@/lib/firebase";
import {  Product } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { NextResponse } from "next/server";


export const PATCH = async (reQ: Request,
    {params} : {params: { productId : string}}
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


        if(!params.productId){
            return new NextResponse("No product specified", {status: 400})
        }


        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);


        for (const storeId of storeIds) {
            const ProductsRef = (
                await getDoc(doc(db, "stores", storeId, "products", params.productId ))
                )
            if(ProductsRef.exists()){
                await updateDoc(
                    doc(db, "stores", storeId, "products", params.productId), {
                        ...ProductsRef.data(),
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


                const product = ProductsRef.data() as Product;


                return NextResponse.json(product);
            }

        }

    
    
    }
   

 catch (error) {
    console.log(`PRODUCT_PATCH:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};




export const DELETE = async (reQ: Request,
    {params} : {params: { productId : string}}
) => {
    try {
        const {userId} = auth()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    


        if(!params.productId){
            return new NextResponse("No product selected", {status: 400})
        }


        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);


        for (const storeId of storeIds) {
            const ProductsRef = (
                await getDoc(doc(db, "stores", storeId, "products", params.productId ))
                )
            if(ProductsRef.exists()){
                const productRef = doc(db, "stores", storeId, "products", params.productId);

                const images = ProductsRef.data()?.images;
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

        }

    
    }
   

 catch (error) {
    console.log(`product_DELETE:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


export const GET = async (req: Request, { params }: { params: { productId: string } }) => {
    try {
        if (!params.productId) {
            return new NextResponse("No product specified", { status: 400 });
        }

        // Step 1: Fetch all store IDs
        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);

        let product = null;

        // Step 2: Iterate through each store to find the product
        for (const storeId of storeIds) {
            const productDoc = await getDoc(doc(db, "stores", storeId, "products", params.productId));
            if (productDoc.exists()) {
                product = productDoc.data() as Product;
                break; // Exit loop once the product is found
            }
        }

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        return new NextResponse(JSON.stringify(product), { status: 200 });

    } catch (error) {
        console.error("Error fetching product:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
