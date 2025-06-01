// get-top-products.ts
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export const getTopProducts = async (storeId: string) => {
  const q = query(
    collection(db, `stores/${storeId}/products`),
    where("isArchived", "==", false),
    orderBy("salesCount", "desc"),
    limit(5)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    quantity: doc.data().salesCount || 0
  }));
};