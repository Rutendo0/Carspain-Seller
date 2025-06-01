import { collection, doc, getDocs, query, where } from "firebase/firestore";
import {format} from "date-fns"
import { OrderClient } from "./components/client";
import { db } from "@/lib/firebase";
import {  Order } from "@/types-db";
import { OrderColumns } from "./components/columns";
import { it } from "node:test";
import { Phone } from "lucide-react";
import { formatter } from "@/lib/utils";


const OrdersPage = async ({params} : {params : {storeId: string}}) => {




    const ordersData = (
        await getDocs(
            query(
                collection(doc(db, "stores", params.storeId), "orders")
            )
        )
    ).docs.map(doc => doc.data()) as Order[];



    const formattedorders : OrderColumns[] = ordersData.map(
        item =>({
            id: item.id,
            isPaid: item.isPaid,
            phone: item.phone,
            address: item.address,
            products: item.orderItems.map(item => item.name).join(", "),
            order_status: item.order_status,
            totalPrice: formatter.format(
                item.orderItems.reduce((total, item) =>{
                    if(item && item.qty !== undefined){
                        return total + Number(item.price * item.qty)
                    }
                    return total
                }, 0)
            ),
            approved: item.approved,
            store_id: item.store_id,
            images: item.orderItems.map(item => item.images[0].url),
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    const filteredOrders = formattedorders.filter(order => order.order_status !== "Complete");


    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <OrderClient data={filteredOrders}/>
        </div>
    </div>
}

export default OrdersPage;