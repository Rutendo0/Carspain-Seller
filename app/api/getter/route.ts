import { db } from "@/lib/firebase";
import { Brand } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { collection, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

interface CollectionPath {
    segments: string[];
}

const COLLECTIONS = {
    BRANDS: {
        segments: ["data", "wModRJCDon6XLQYmnuPT", "brands"]
    },
    // Add other collections here following the same pattern
    // ORDERS: {
    //     segments: ["data", "wModRJCDon6XLQYmnuPT", "orders"]
    // },
    // RETURNS: {
    //     segments: ["data", "wModRJCDon6XLQYmnuPT", "returns"]
    // }
};

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const collectionName = searchParams.get('collection') as keyof typeof COLLECTIONS;
        
        if (!collectionName || !COLLECTIONS[collectionName]) {
            return new NextResponse("Collection parameter is missing or invalid", { status: 400 });
        }

        // Build the collection reference dynamically
        const collectionPath = COLLECTIONS[collectionName];
        let collectionRef = collection(db, collectionPath.segments[0], ...collectionPath.segments.slice(1));

        // Get all documents from the specified collection
        const snapshot = await getDocs(collectionRef);
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(data);
    
    } catch (error) {
        console.log(`[GENERIC_GET_ERROR]:${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};