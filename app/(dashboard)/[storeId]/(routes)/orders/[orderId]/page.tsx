import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Order } from "@/types-db"
import { OrderForm } from "./_components/order-form";

const OrderPage = async ({
    params}: {params: Promise<{ storeId : string ,orderId: string}>}) => {
  const { storeId, orderId } = await params;

        const order = (await getDoc(doc(db, "stores", storeId,
            "orders", orderId
        ))).data() as Order;




    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <OrderForm initialData={order}></OrderForm>
        </div>
    );
}

export default OrderPage;