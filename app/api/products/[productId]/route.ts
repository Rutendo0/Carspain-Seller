import { db, storage } from "@/lib/firebase";
import {  Product } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { NextResponse } from "next/server";



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
