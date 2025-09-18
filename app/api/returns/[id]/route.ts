import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();

    if (!adminDb) {
      return new NextResponse("Firebase Admin not initialized", { status: 500 });
    }

    await adminDb
      .collection("data").doc("wModRJCDon6XLQYmnuPT")
      .collection("returns").doc(params.id)
      .update({ status, updatedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
