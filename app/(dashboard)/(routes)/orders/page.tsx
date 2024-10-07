import { collection, doc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import { OrderClient } from "./components/client";
import { db } from "@/lib/firebase";
import {  Order } from "@/types-db";
import { OrderColumns } from "./components/columns";
import { it } from "node:test";
import { Phone } from "lucide-react";
import { formatter } from "@/lib/utils";


const OrdersPage = async () => {

    let allOrders : Order[] = [];


    const storesSnapshot = await getDocs(collection(db, "stores"));
    const storeIds = storesSnapshot.docs.map(doc => doc.id);
    for (const storeId of storeIds) {
        const ordersData = (
            await getDocs(
                collection(doc(db, "stores", storeId), "orders")
            )
        ).docs.map(doc => doc.data()) as Order[];

        const filteredOrders = ordersData.filter(order => order.order_status !== "Complete");

        const Neworders = allOrders.concat(filteredOrders)
        allOrders = Neworders;
    }
 




    const formattedorders : OrderColumns[] = allOrders.map(
        item =>({
            id: item.id,
            userId: item.userId,
            isPaid: item.isPaid,
            number: item.number,
            address: item.address,
            deliveryIn: item.deliveryInstructions,
            store_name: item.store_name,
            products: item.orderItems.map(ite => ite.name).join(", "),
            store_id: item.store_id,
            order_status: item.order_status,
            totalPrice: formatter.format(
                item.orderItems.reduce((total, item) =>{
                    if(item && item.qty !== undefined){
                        return total + Number(item.price * item.qty)
                    }
                    return total
                }, 0)
            ),
            images: item.orderItems.map(item => item.images[0].url),
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <OrderClient data={formattedorders}/>
        </div>
    </div>
}

export default OrdersPage;