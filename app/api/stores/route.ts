import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

interface StoreData {
    name: string;
    address: string;
    store_owner: string;
    ownerID: string;
    tax_clearance: string;
    number: string;
    userId: string;
    createdAt: any;
    latitude?: number;
    longitude?: number;
    formatted_address?: string;
    place_name?: string;
}

export const POST = async(req: Request) => {
    try {
        const {userId} = auth()
        const body = await req.json()

        if(!userId){
            return new NextResponse("Unauthorized", {status: 401})
        }

        const {
            name, 
            address, 
            store_owner, 
            ownerID, 
            tax_clearance, 
            number,
            latitude,
            longitude,
            formatted_address,
            place_name
        } = body;

        if(!name){
            return new NextResponse("Store Name is required", {status: 400})
        }
        if(!address){
            return new NextResponse("Store Address is required", {status: 400})
        }

        const storeData: StoreData = {
            name,
            address,
            store_owner, 
            ownerID,
            tax_clearance,
            number,
            userId,
            createdAt: serverTimestamp(),
            ...(latitude && { latitude: Number(latitude) }),
            ...(longitude && { longitude: Number(longitude) }),
            ...(formatted_address && { formatted_address }),
            ...(place_name && { place_name })
        }

        const storeRef = await addDoc(collection(db, "stores"), storeData);
        const id = storeRef.id

        await updateDoc(doc(db, "stores", id), {
            ...storeData,
            id,
            updatedAt: serverTimestamp()
        })

        return NextResponse.json({
            id,
            ...storeData,
            createdAt: new Date().toISOString() // Return a readable date for the client
        });

    } catch (error) {
        console.error(`STORES_POST:`, error);
        return new NextResponse("Internal Server Error", {status: 500})
    }
}