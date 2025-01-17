import { db } from "@/lib/firebase";
import {  Category, Review } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";



const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export const OPTIONS = async () => {
    return NextResponse.json({}, {headers: corsHeaders})
}

export const POST = async (reQ: Request, {params} : {params: { userId : string}}
) => {
   

    return NextResponse.json({headers: corsHeaders})
    
    
    }
   


;




