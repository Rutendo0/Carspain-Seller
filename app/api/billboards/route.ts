import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
// Firestore bypassed for mock development

export const POST = async (reQ: Request) => {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('__session')?.value

    if (!token) {
      return new NextResponse("Unauthorized", {status: 401})
    }

    let userId
    try {
      const decodedToken = await adminAuth.verifyIdToken(token)
      userId = decodedToken.uid
    } catch (error) {
      return new NextResponse("Unauthorized", {status: 401})
    }

    if(!userId){
        return new NextResponse("Unauthorized", {status: 400})
    }

    const body = await reQ.json()
    
    const {label, imageUrl} = body;
    
    
    if(!label){
        return new NextResponse("Billboard Name Missing", {status: 400})
    }
    if(!imageUrl){
        return new NextResponse("Billboard Image Missing", {status: 400})
    }


    // Mock billboard creation without Firestore
    const id = `billboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const billboardData = {
      id,
      label,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    console.log(`Mock billboard created: ${id}`, billboardData);

    return NextResponse.json(billboardData);
  } catch (error) {
    console.log(`BILLBOARDS_POST: ${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
  }
};

export const GET = async (reQ: Request) => {
  try {
    // Mock: Return empty array for development without Firestore
    return NextResponse.json([]);
  } catch (error) {
    console.log(`BILLBOARDS_GET: ${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
  }
};

