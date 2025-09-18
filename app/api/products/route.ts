import { db } from "@/lib/firebase";
import {  Industry, Product } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, and, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {

        const storesSnapshot = await getDocs(collection(db, "stores"));
        let allProducts :  Product[] = [];

        for (const storeDoc of storesSnapshot.docs) {

            const productsSnapshot = await getDocs(collection(storeDoc.ref, "products"));
            productsSnapshot.forEach((productDoc) => {
                allProducts.push(productDoc.data() as Product);
            });
        }

        return NextResponse.json(allProducts);
    
    
    }
   

 catch (error) {
    console.log(`PRODUCTS_GET:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};


