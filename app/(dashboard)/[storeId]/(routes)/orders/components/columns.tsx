"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CellImage from "./cell-image";
import { cn } from "@/lib/utils";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export type OrderColumns = {
  id: string;
  phone: string;
  address: string;
  products: string;
  totalPrice: string;
  images: string[];
  isPaid: boolean;
  createdAt: string;
  order_status: string;
  approved: string;
  store_id: string;
};
async function approveOrder(orderId: string, storeId: string) {
  try {
    const orderRef = doc(db, "stores", storeId, "orders", orderId);
    
    await updateDoc(orderRef, {
      approved: "Approved",
      updatedAt: serverTimestamp(),
    });

    toast.success(`Order ${orderId} successfully approved`);
  } catch (error) {
    toast.error("Error approving order");
  }
}

export const columns: ColumnDef<OrderColumns>[] = [
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => (
      <div className="grid grid-cols-2 gap-2">
        <CellImage data={row.original.images} />
      </div>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "totalPrice",
    header: "Amount",
  },
  {
    accessorKey: "isPaid",
    header: "Payment Status",
    cell: ({ row }) => {
      const { isPaid } = row.original;
      return (
        <p
          className={cn(
            "text-lg font-semibold",
            isPaid ? "text-green-500" : "text-red-500"
          )}
        >
          {isPaid ? "Paid" : "Not Paid"}
        </p>
      );
    },
  },
  {
    accessorKey: "order_status",
    header: "Delivery Status",
    cell: ({ row }) => {
      const { order_status } = row.original;
      return (
        <p
          className={cn(
            "text-base font-semibold",
            order_status === "Processing"
              ? "text-orange-500"
              : order_status === "Delivering"
              ? "text-blue-500"
              : order_status === "Delivered"
              ? "text-green-500"
              : ""
          )}
        >
          {order_status}
        </p>
      );
    },
  },
  {
    accessorKey: "approved",
    header: "Approval Status",
    cell: ({ row }) => {
      const { approved } = row.original;
      return (
        <span
          className={cn(
            "text-white font-semibold px-2 py-1 rounded-lg",
            approved === "Approved"
              ? "bg-lime-500"
              : "bg-gradient-to-r from-orange-500 to-red-500 animate-pulse"
          )}
        >
          {approved === "Approved" ? "Approved" : "Pending"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id, approved, store_id } = row.original;
      
      if (approved !== "Approved" && approved !== "Complete") {
        return (
          <Button
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-indigo-400 text-white hover:from-indigo-600 hover:to-purple-700"
            onClick={async () => {
              try {
                await approveOrder(id, store_id);
                // You might want to add a toast notification here
                // toast.success("Order approved successfully");
                
                // If you're using client-side state management, you might want to:
                // 1. Update the local state to reflect the change immediately
                // 2. Trigger a refetch of the orders data
              } catch (error) {
                console.error("Failed to approve order:", error);
                // toast.error("Failed to approve order");
              }
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        );
      }
      
      return null;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA: any = new Date(rowA.original.createdAt).getTime();
      const dateB: any = new Date(rowB.original.createdAt).getTime();
      return dateA - dateB;
    },
  },
];
