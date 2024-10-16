import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import {  StoreClient } from "./components/client";
import { db } from "@/lib/firebase";
import {  Order, Store } from "@/types-db";
import {  StoreColumns } from "./components/columns";
import { it } from "node:test";
import { Phone } from "lucide-react";
import { formatter } from "@/lib/utils";


const OrdersPage = async () => {

    let allStores : Store[] = [];


    const storesSnapshot = (await getDocs(collection(db, "stores")));
    const storesList = storesSnapshot.docs.map(doc => doc.data() as Store);

 




    const formattedstores : StoreColumns[] = storesList.map(
        item =>({
            id: item.id,
            number: item.number,
            address: item.address,
            name: item.name,
            tax_clearance: item.tax_clearance,
            store_owner: item.store_owner,
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : "",
            ownerID: item.ownerID,
            userId: item.userId
        })
    )




    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <StoreClient data={formattedstores}/>
        </div>
    </div>
}

export default OrdersPage;