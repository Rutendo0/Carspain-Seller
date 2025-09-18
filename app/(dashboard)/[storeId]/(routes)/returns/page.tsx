"use server"
import { headers } from "next/headers";
import ReturnsPage from "./returns";
import { ReturnData } from "@/types-db"; // Import the ReturnData type

const Home = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  // Fetch returns data via server API (Admin SDK)
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : '');
  const res = await fetch(`${base}/api/returns?storeId=${storeId}`, { cache: 'no-store' });
  const returnsData = (await res.json()) as ReturnData[];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ReturnsPage initialData={returnsData} storeId={storeId} />
      </div>
    </div>
  );
}

export default Home;