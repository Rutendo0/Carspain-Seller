import { db } from "@/lib/firebase"
import { Order, Product } from "@/types-db"
import { collection, doc, getDocs } from "firebase/firestore"

export const getInventory = async () => {

    const storesSnapshot = await getDocs(collection(db, "stores"));
    let allProducts :  Product[] = [];

    for (const storeDoc of storesSnapshot.docs) {

        const productsSnapshot = await getDocs(collection(storeDoc.ref, "products"));
        productsSnapshot.forEach((productDoc) => {
            allProducts.push(productDoc.data() as Product);
        });
    }

    const total = allProducts.length;

    return total;
}
