"use client"

import { useEffect, useState } from "react";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { format } from "date-fns";
import { OrderClient } from "./components/client";
import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { OrderColumns } from "./components/columns";
import { formatter } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OrdersPageProps {
    store_id: string;
}

const OrdersPage = ({ store_id }: OrdersPageProps) => {
    const [orders, setOrders] = useState<OrderColumns[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersData = (
                    await getDocs(
                        query(
                            collection(doc(db, "stores", store_id), "orders")
                        )
                    )
                ).docs.map(doc => doc.data()) as Order[];

                const formattedOrders: OrderColumns[] = ordersData.map(
                    item => ({
                        id: item.id,
                        isPaid: item.isPaid,
                        phone: item.phone,
                        address: item.address,
                        products: item.orderItems.map(item => item.name).join(", "),
                        order_status: item.order_status,
                        totalPrice: formatter.format(
                            item.orderItems.reduce((total, item) => {
                                if (item && item.qty !== undefined) {
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
                );

                const filteredOrders = formattedOrders.filter(order => order.order_status !== "Complete");
                setOrders(filteredOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [store_id]);

    if (loading) {
        return (
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-200" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrderClient data={orders} />
            </div>
        </div>
    );
};

export default OrdersPage;