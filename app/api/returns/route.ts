import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const returnsQuery = query(
      collection(db, "data", "wModRJCDon6XLQYmnuPT", "returns"),
      where("originalOrder.storeId", "==", storeId)
    );

    const returnsSnapshot = await getDocs(returnsQuery);
    const returnsData = returnsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(returnsData);
    
  } catch (error) {
    console.error('[RETURNS_GET]', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};