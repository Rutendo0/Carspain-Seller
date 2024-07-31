import { db } from "@/lib/firebase"
import { Order } from "@/types-db"
import { collection, doc, getDocs } from "firebase/firestore"

export const getInventory = async (storeId: string) => {
    const productsData = (
        await getDocs(collection(doc(db, "stores", storeId), "products"))
    );

    const total = productsData.size;

    return total;
}
