import { db } from "@/lib/firebase"
import { Order } from "@/types-db"
import { collection, doc, getDocs } from "firebase/firestore"

interface GraphData {
    name: string,
    total: number
}

export const getStatusRevenue = async (storeId: string) => {
    const orderData = (
        await getDocs(collection(doc(db, "stores", storeId), "orders"))
    ).docs.map((i) => i.data()) as Order[];



    const statusR: {[key: string]: number} = {};

    for (const order of orderData) {
        const status = order.isPaid ? "Paid": "Not Paid";
        const month = order.createdAt?.toDate().toLocaleDateString("en-US", {month: "short"});

        if(status){
            let orderRev = 0;

            for (const item of order.orderItems){
                orderRev += item.price
            }

            statusR[status] = (statusR[status] || 0) + orderRev;
        }


    };

    const statusMap : {[key: string]:number} = {
        Paid: 0,
        "Not Paid": 1
    };


    const gData : GraphData[] = Object.keys(statusMap).map(mname => ({
        name: mname,
        total: statusR[mname] || 0
    }));


    return gData;
}
