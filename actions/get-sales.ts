import { db } from "@/lib/firebase"
import { Order } from "@/types-db"
import { collection, doc, getDocs } from "firebase/firestore"

export const getOrders = async () => {
    const storesSnapshot = await getDocs(collection(db, "stores"));
    let allOrders :  Order[] = [];

    for (const storeDoc of storesSnapshot.docs) {

        const ordersSnapshot = await getDocs(collection(storeDoc.ref, "orders"));
        ordersSnapshot.forEach((productDoc) => {
            allOrders.push(productDoc.data() as Order);
        });
    }


    const totalOrders = allOrders.length;

    return totalOrders;
}
