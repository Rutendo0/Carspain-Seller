import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { Product } from "@/types-db";

export const POST = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    if (!adminAuth || !adminDb) {
      return new NextResponse("Firebase admin not initialized", { status: 500 });
    }

    const cookieStore = cookies();
    const token = (await cookieStore).get("__session")?.value;

    if (!token) return new NextResponse("Unauthorized", { status: 401 });

    let userId: string | undefined;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      userId = decoded.uid;
    } catch {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeId } = params;
    if (!storeId) return new NextResponse("No store selected", { status: 400 });

    const body = await req.json();
    const {
      name,
      price,
      Code,
      images,
      isFeatured,
      isArchived,
      category,
      brand,
      model,
      stock,
      year,
    } = body as Partial<Product> & { Code?: string };

    if (!name) return new NextResponse("Category Name Missing", { status: 400 });
    if (!images || !images.length)
      return new NextResponse("Images missing Missing", { status: 400 });
    if (price === undefined)
      return new NextResponse("No price specified", { status: 400 });
    if (!category) return new NextResponse("No category selected", { status: 400 });
    if (!Code) return new NextResponse("No OEM specified", { status: 400 });
    if (year === undefined) return new NextResponse("No year specified", { status: 400 });

    // Ownership check
    const storeDoc = await adminDb.collection("stores").doc(storeId).get();
    if (!storeDoc.exists) return new NextResponse("Store not found", { status: 404 });
    const storeData = storeDoc.data() as { userId?: string };
    if (storeData?.userId !== userId)
      return new NextResponse("Unauthorized Access", { status: 403 });

    const productsCol = adminDb
      .collection("stores")
      .doc(storeId)
      .collection("products");

    const newDocRef = await productsCol.add({
      name,
      price,
      Code,
      images,
      isFeatured: !!isFeatured,
      isArchived: !!isArchived,
      category,
      brand,
      model,
      stock,
      year,
      createdAt: FieldValue.serverTimestamp(),
    });

    const id = newDocRef.id;
    await newDocRef.update({ id, updatedAt: FieldValue.serverTimestamp() });

    const saved = (await newDocRef.get()).data();
    return NextResponse.json(saved);
  } catch (error) {
    console.log(`PRODUCTS_POST:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    if (!adminDb) {
      return new NextResponse("Firebase admin not initialized", { status: 500 });
    }

    const { storeId } = params;
    if (!storeId) return new NextResponse("No store selected", { status: 400 });

    const { searchParams } = new URL(req.url);
    let q: FirebaseFirestore.Query = adminDb
      .collection("stores")
      .doc(storeId)
      .collection("products");

    const pushWhere = (field: string, value: any) => {
      q = q.where(field, "==", value);
    };

    if (searchParams.has("industry")) pushWhere("industry", searchParams.get("industry"));
    if (searchParams.has("category")) pushWhere("category", searchParams.get("category"));
    if (searchParams.has("brand")) pushWhere("brand", searchParams.get("brand"));
    if (searchParams.has("model")) pushWhere("model", searchParams.get("model"));
    if (searchParams.has("isFeatured")) pushWhere("isFeatured", searchParams.get("isFeatured") === "true");
    if (searchParams.has("isArchived")) pushWhere("isArchived", searchParams.get("isArchived") === "true");

    const snap = await q.get();
    const products = snap.docs.map(d => d.data() as Product);
    return NextResponse.json(products);
  } catch (error) {
    console.log(`PRODUCTS_GET:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const runtime = "nodejs";