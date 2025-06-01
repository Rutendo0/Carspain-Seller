// app/api/returns/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    
    await updateDoc(
      doc(db, "data", "wModRJCDon6XLQYmnuPT", "returns", params.id),
      { 
        status,
        updatedAt: serverTimestamp() 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}