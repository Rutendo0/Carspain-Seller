import { adminAuth } from "@/lib/firebase-admin";
// adminDb not used - Firestore bypassed for mock development
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

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

    // Mock store creation without Firestore
    const id = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Simple unique ID
    const storeData: StoreData = {
      id,
      name: body.name,
      address: body.address,
      store_owner: body.store_owner,
      ownerID: String(body.ownerID),
      tax_clearance: body.tax_clearance,
      number: body.number,
      userId,
      createdAt: new Date().toISOString(),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(body.formatted_address && { formatted_address: body.formatted_address }),
      ...(body.place_name && { place_name: body.place_name }),
    };

    // Store full store data in cookie as JSON for persistence
    const cookieStore = await cookies();
    cookieStore.set('storeData', JSON.stringify(storeData), { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    console.log(`Mock store created: ${id}`, storeData);

    return NextResponse.json(storeData);
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

    const cookieStore = await cookies();
    const storeDataJson = cookieStore.get('storeData')?.value;

    if (storeDataJson) {
      const storeData = JSON.parse(storeDataJson);
      return NextResponse.json({ store: storeData });
    }

    // No store yet
    return NextResponse.json({ store: null });
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