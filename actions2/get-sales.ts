import { db } from "@/lib/firebase"
import { Order } from "@/types-db"
import { collection, doc, getDocs } from "firebase/firestore"

export const getOrders = async (storeId: string) => {
    const ordersData = (
        await getDocs(collection(doc(db, "stores", storeId), "orders"))
    );

    const totalOrders = ordersData.size;

    return totalOrders;
}
