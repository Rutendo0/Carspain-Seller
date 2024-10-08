"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CellAction } from "./cell-action"
import CellImage from "./cell-image"
import { cn } from "@/lib/utils"

export type OrderColumns = {
  id: string;
  number: string,
  address: string,
  products: string,
  totalPrice : string,
  images: string[],
  isPaid: boolean;
  store_name: string,
  createdAt: string
  order_status: string,
  store_id: string,
  store_address: string,
  userId: string,
  deliveryIn: string
}
export const columns: ColumnDef<OrderColumns>[] = [
  {
    accessorKey: "images",
    header: "Images",
    cell : ({row}) => (
      <div className="grid grid-cols-2 gap-2 olverflow-y-auto">
        <CellImage data={row.original.images}/>
      </div>
    )
  },
  {
    accessorKey: "products",
    header: "Products"
  },
  {
    accessorKey: "number",
    header: "Client Phone"
  },
  {
    accessorKey: "address",
    header: "Client Address"
  },
  {
    accessorKey: "shop_name",
    header: "Shop Name"
  },
  {
    accessorKey: "totalPrice",
    header: "Amount"
  },
  {
    accessorKey: "isPaid",
    header: "Payment Status",
    cell : ({row}) => {
      const {isPaid} = row.original;

      return <p
      className={cn("text-lg font-semibold",
        isPaid ? "text-green-500" : "text-red-500"
      )}>
        {isPaid ? "Paid" : "Not Paid"}</p>
    }
  },

  {
    accessorKey: "order_status",
    header: "Order Status",
    cell : ({row}) => {
      const {order_status} = row.original

      return (
        <p className={cn(
          "text-base font-semibold",
          (order_status === "Processing" && "text-orange-500") ||
          (order_status === "Delivering" && "text-blue-500") ||
          (order_status === "Delivered" && "text-green-500") 
        )}>
          {order_status}</p>
      )
    } 
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
      )
    },
  },
  {
    id: "Actions",
    cell: ({row}) => <CellAction data={row.original} />
  }
]
