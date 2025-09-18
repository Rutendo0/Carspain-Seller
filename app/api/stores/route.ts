import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

interface StoreData {
  name: string;
  address: string;
  store_owner: string;
  ownerID: string;
  tax_clearance: string;
  number: string;
  userId: string;
  createdAt: any;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  place_name?: string;
}

async function getUserIdFromAuth(): Promise<string | null> {
  // Try cookie first
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (token) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return decoded.uid;
    } catch (_) {
      // fall through to header
    }
  }

  // Fallback to Authorization header (Bearer <token>)
  const h = await headers();
  const authHeader = h.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const idToken = authHeader.substring(7);
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      return decoded.uid;
    } catch (_) {
      return null;
    }
  }

  return null;
}

export const POST = async (req: Request) => {
  try {
    const userId = await getUserIdFromAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Basic schema-like validation without bringing a full validator
    const errors: Record<string, string> = {};
    const requiredString = (val: any) => typeof val === 'string' && val.trim().length > 0;

    if (!requiredString(body.name)) errors.name = "Store name is required and must be a non-empty string.";
    if (!requiredString(body.address)) errors.address = "Store address is required and must be a non-empty string.";
    if (!requiredString(body.store_owner)) errors.store_owner = "Owner full name is required.";
    if (!requiredString(body.ownerID) || String(body.ownerID).length < 8) errors.ownerID = "Owner ID is required and must be at least 8 characters.";
    if (!requiredString(body.tax_clearance)) errors.tax_clearance = "Tax clearance is required.";
    if (!requiredString(body.number)) errors.number = "Phone number is required.";

    const latitude = body.latitude !== undefined ? Number(body.latitude) : undefined;
    const longitude = body.longitude !== undefined ? Number(body.longitude) : undefined;
    if (latitude !== undefined && Number.isNaN(latitude)) errors.latitude = "Latitude must be a number.";
    if (longitude !== undefined && Number.isNaN(longitude)) errors.longitude = "Longitude must be a number.";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const storeData: StoreData = {
      name: body.name,
      address: body.address,
      store_owner: body.store_owner,
      ownerID: String(body.ownerID),
      tax_clearance: body.tax_clearance,
      number: body.number,
      userId,
      createdAt: FieldValue.serverTimestamp(),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(body.formatted_address && { formatted_address: body.formatted_address }),
      ...(body.place_name && { place_name: body.place_name }),
    };

    const docRef = await adminDb.collection('stores').add(storeData);
    const id = docRef.id;
    await docRef.update({ id }); // Add ID back to doc

    console.log(`Store created: ${id}`, storeData);

    const isHttps = new URL(req.url).protocol === 'https:'
    const response = NextResponse.json({ id, ...storeData });
    response.cookies.set('storeData', JSON.stringify({ id, userId }), {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });
    return response;
  } catch (error: any) {
    console.error(`STORES_POST:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const GET = async () => {
  try {
    const userId = await getUserIdFromAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb.collection('stores').where('userId', '==', userId).limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json({ store: null });
    }

    const storeDoc = snapshot.docs[0];
    const storeData = { id: storeDoc.id, ...storeDoc.data() };

    return NextResponse.json({ store: storeData });
  } catch (error: any) {
    console.error(`STORES_GET:`, error);
    // Provide more detail in development to diagnose issues
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Internal Server Error', message: error?.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const runtime = "nodejs";