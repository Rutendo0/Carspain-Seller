import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { Order, Product } from "@/types-db";

export const GET = async (
  _req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const { storeId } = params;
    if (!storeId) return NextResponse.json({ error: "No store selected" }, { status: 400 });

    const ordersSnap = await adminDb
      .collection("stores").doc(storeId)
      .collection("orders").get();
    const productsSnap = await adminDb
      .collection("stores").doc(storeId)
      .collection("products").get();

    const orders = ordersSnap.docs.map(d => d.data() as Order);
    const products = productsSnap.docs.map(d => d.data() as Product);

    const totalSales = orders.length;
    const totalProducts = products.length;

    const paidOrders = orders.filter(o => o.isPaid);
    const totalRevenue = paidOrders.reduce((sum, o) => {
      const orderTotal = (o.orderItems || []).reduce((s, item) => s + Number(item.price || 0), 0);
      return sum + orderTotal;
    }, 0);

    const monthMap: Record<string, number> = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
    const monthly: Record<string, number> = {};
    for (const o of paidOrders) {
      const dt = (o.createdAt as any)?.toDate?.() || new Date();
      const m = dt.toLocaleDateString("en-US", { month: "short" });
      const orderTotal = (o.orderItems || []).reduce((s, item) => s + Number(item.price || 0), 0);
      monthly[m] = (monthly[m] || 0) + orderTotal;
    }
    const graphRevenue = Object.keys(monthMap).map(name => ({ name, total: monthly[name] || 0 }));

    const statusRevenueMap: Record<string, number> = { Paid: 0, "Not Paid": 0 };
    for (const o of orders) {
      const orderTotal = (o.orderItems || []).reduce((s, item) => s + Number(item.price || 0), 0);
      if (o.isPaid) statusRevenueMap["Paid"] += orderTotal; else statusRevenueMap["Not Paid"] += orderTotal;
    }
    const statusRevenue = Object.keys(statusRevenueMap).map(name => ({ name, total: statusRevenueMap[name] }));

    return NextResponse.json({
      totalRevenue,
      totalSales,
      totalProducts,
      graphRevenue,
      statusRevenue,
      orders, // optional: client can derive charts
    });
  } catch (e) {
    console.error("DASHBOARD_GET:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const runtime = "nodejs";