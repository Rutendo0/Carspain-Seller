import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { Order } from "@/types-db";

export const GET = async (
  _req: Request,
  { params }: { params: { orderId: string } }
) => {
  try {
    const { orderId } = params;
    if (!orderId) return new NextResponse("Order ID required", { status: 400 });

    if (!adminDb) {
      return new NextResponse("Firebase Admin not initialized", { status: 500 });
    }

    // Search across all stores with Admin SDK
    const storesSnap = await adminDb.collection("stores").get();
    let found: Order | null = null;
    for (const storeDoc of storesSnap.docs) {
      const snap = await adminDb
        .collection("stores").doc(storeDoc.id)
        .collection("orders").where("id", "==", orderId).limit(1).get();
      if (!snap.empty) {
        found = snap.docs[0].data() as Order;
        break;
      }
    }
    return NextResponse.json(found);
  } catch (error) {
    console.log(`ORDERS_SINGLE_GET:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const PATCH = async (
  req: Request,
  { params }: { params: { orderId: string } }
) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__session")?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 401 });

    if (!adminAuth) {
      return new NextResponse("Firebase Admin not initialized", { status: 500 });
    }

    try { await adminAuth.verifyIdToken(token); } catch { return new NextResponse("Unauthorized", { status: 401 }); }

    const { order_status, store_id } = await req.json();
    if (!order_status || !store_id) return new NextResponse("Invalid body", { status: 400 });

    if (!adminDb) {
      return new NextResponse("Firebase Admin not initialized", { status: 500 });
    }

    const orderDoc = await adminDb
      .collection("stores").doc(store_id)
      .collection("orders").doc(params.orderId).get();

    if (!orderDoc.exists) return new NextResponse("Order not found", { status: 404 });

    await adminDb
      .collection("stores").doc(store_id)
      .collection("orders").doc(params.orderId)
      .update({ order_status });

    const updated = (await adminDb
      .collection("stores").doc(store_id)
      .collection("orders").doc(params.orderId).get()).data() as Order;

    return NextResponse.json(updated);
  } catch (error) {
    console.log(`ORDER_PATCH:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  _req: Request,
  { params }: { params: { orderId: string } }
) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__session")?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 401 });

    if (!adminAuth) {
      return new NextResponse("Firebase Admin not initialized", { status: 500 });
    }
    try { await adminAuth.verifyIdToken(token); } catch { return new NextResponse("Unauthorized", { status: 401 }); }

    if (!adminDb) {
      return new NextResponse("Firebase Admin not initialized", { status: 500 });
    }

    const storesSnap = await adminDb.collection("stores").get();
    for (const storeDoc of storesSnap.docs) {
      const ref = adminDb
        .collection("stores").doc(storeDoc.id)
        .collection("orders").doc(params.orderId);
      const docSnap = await ref.get();
      if (docSnap.exists) await ref.delete();
    }

    return NextResponse.json({ msg: "order Deleted" });
  } catch (error) {
    console.log(`order_DELETE:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const runtime = 'nodejs';
