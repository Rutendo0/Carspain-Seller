import { db } from "@/lib/firebase";
import {  Order } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";



export const DELETE = async (reQ: Request, { params }: { params: { userId: string } }) => {

    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 400 });
        }

        if (!params.userId) {
            return new NextResponse("No client selected", { status: 400 });
        }

        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);

        for (const storeId of storeIds) {
            const ordersRef = collection(db, "stores", storeId, "orders");
            const q = query(ordersRef, where("userId", "==", params.userId),
            where("order_status", "!=", "Complete"));

            const querySnapshot = await getDocs(q);

            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        }

        return NextResponse.json({ msg: "Orders Deleted" });

    } catch (error) {
        console.log(`order_DELETE: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};



