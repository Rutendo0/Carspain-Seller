import { collection, doc, getDocs, limit, query } from "firebase/firestore";
import {format} from "date-fns"
import {  ProductClient } from "./components/client";
import { db } from "@/lib/firebase";
import { Product } from "@/types-db";
import { ProductColumns } from "./components/columns";
import { it } from "node:test";
import { formatter } from "@/lib/utils";
import emailjs from 'emailjs-com';
import { adminAuth } from "@/lib/firebase-admin";
import { cookies, headers } from "next/headers";
import toast from "react-hot-toast";

const ProductsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  if (!adminAuth) {
    throw new Error("Firebase admin auth not initialized");
  }

  const { storeId } = await params;

    const h = headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'http';
    const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : '');
    const apiRes = await fetch(`${base}/api/${storeId}/products`, { cache: 'no-store' });
    const ProductsData = (await apiRes.json()) as Product[];

    const cookieStore = await cookies()
    const token = cookieStore.get('__session')?.value

    let userEmail, username
    if (token) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token)
        userEmail = decodedToken.email
        username = decodedToken.name || decodedToken.email
      } catch (error) {
        console.error('Token verification failed:', error)
      }
    }

    const formattedProducts : ProductColumns[] = ProductsData.map(
        item =>({
            id: item.id,
            name: item.name,
            price: formatter.format(item.price),
            stock: item.stock,
            isFeatured: item.isFeatured,
            isArchived: item.isArchived,
            category: item.category,
            industry: item.industry,
            brand: item.brand,
            model: item.model,
            images: item.images,
            year: item.year ? format(item.year, "yyyy") : "",
            createdAt: item.createdAt ? format(item.createdAt.seconds, "MMMM dd, yyyy") : ""
        })
    )

    


    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ProductClient data={formattedProducts} email={userEmail} uname={username}/>
        </div>
    </div>
}
 
export default ProductsPage;