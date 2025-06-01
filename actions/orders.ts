import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { collection, doc, getDocs } from "firebase/firestore";

export const getOrders2 = async (storeId: string): Promise<Order[]> => {
    const ordersSnapshot = await getDocs(
        collection(doc(db, "stores", storeId), "orders")
    );

    const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);
    
    return orders;
};