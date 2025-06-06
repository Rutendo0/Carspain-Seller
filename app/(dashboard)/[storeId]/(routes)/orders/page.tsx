import { collection, doc, getDocs, query, where } from "firebase/firestore";
import {format} from "date-fns"
import { OrderClient } from "./components/client";
import { db } from "@/lib/firebase";
import {  Order } from "@/types-db";
import { OrderColumns } from "./components/columns";
import { it } from "node:test";
import { Phone } from "lucide-react";
import { formatter } from "@/lib/utils";
import OrdersPage from "./holder";


const OrdersPager = async ({params} : {params : {storeId: string}}) => {

    return <>
    <OrdersPage store_id={params.storeId}/>
    </>
}

export default OrdersPager;