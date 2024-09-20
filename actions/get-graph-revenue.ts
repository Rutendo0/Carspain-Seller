import { db } from "@/lib/firebase"
import { Order } from "@/types-db"
import { collection, doc, getDocs } from "firebase/firestore"

interface GraphData {
    name: string,
    total: number
}

export const getGraphRevenue = async () => {


    const storesSnapshot = await getDocs(collection(db, "stores"));
    const storeIds = storesSnapshot.docs.map(doc => doc.id);

    const monthlyR: {[key: string]: number} = {};


    for (const storeId of storeIds) {

        const orderData = (
            await getDocs(collection(doc(db, "stores", storeId), "orders"))
        ).docs.map((i) => i.data()) as Order[];
    
        const paidOrders = orderData.filter((order) => order.isPaid);
    

    
        for (const order of paidOrders) {
            const month = order.createdAt?.toDate().toLocaleDateString("en-US", {month: "short"});
    
            if(month){
                let orderRev = 0;
    
                for (const item of order.orderItems){
                    orderRev += item.price
                }
    
                monthlyR[month] = (monthlyR[month] || 0) + orderRev;
            }
    
    
        };

    }


    const monthMap : {[key: string]:number} = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11

    };


    const gData : GraphData[] = Object.keys(monthMap).map(mname => ({
        name: mname,
        total: monthlyR[mname] || 0
    }));


    return gData;
}
