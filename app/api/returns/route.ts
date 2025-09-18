import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!adminDb) {
      return new NextResponse("Firebase Admin not initialized", { status: 500 });
    }

    const snap = await adminDb
      .collection("data").doc("wModRJCDon6XLQYmnuPT")
      .collection("returns")
      .where("originalOrder.store_id", "==", storeId)
      .get();

    const returnsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(returnsData);
    
  } catch (error) {
    console.error('[RETURNS_GET]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
