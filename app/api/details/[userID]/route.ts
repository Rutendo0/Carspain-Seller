import { db } from "@/lib/firebase";
import {  Brand, Order } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";



export const GET = async (reQ: Request,
    {params} : {params: {userID : string}}
) => {
    try { const orderQuery = query( collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), params.userID)); 
         const orderData = ( await getDocs(orderQuery) ).docs.map(doc => doc.data()) as Order[];
         return NextResponse.json(orderData); 
        } 
    catch (error)
    { console.error("Error fetching order data:", error); 
     return new NextResponse("Internal Server Error", { status: 500 });
    }
};


