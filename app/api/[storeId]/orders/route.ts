import { adminDb } from "@/lib/firebase-admin";
import { Order } from "@/types-db";
import { NextResponse } from "next/server";

export const GET = async (
  _req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    if (!adminDb) {
      return new NextResponse("Firebase admin not initialized", { status: 500 });
    }

    const { storeId } = params;

    if (!storeId) {
      return new NextResponse("No store selected", { status: 400 });
    }

    // Use Firebase Admin SDK on the server for reliable access and proper credentials
    const snapshot = await adminDb
      .collection("stores")
      .doc(storeId)
      .collection("orders")
      .get();

    const orders = snapshot.docs.map((d) => d.data() as Order);

    return NextResponse.json(orders);
  } catch (error) {
    console.log(`ORDERS_GET:${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const runtime = "nodejs";