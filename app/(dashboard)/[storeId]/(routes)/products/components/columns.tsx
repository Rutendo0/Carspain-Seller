"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CellAction } from "./cell-action"
import { Timestamp } from "firebase/firestore"
import { cn } from "@/lib/utils"

export type ProductColumns = {
    id: string;
    name: string;
    price: string,
    stock: number;
    images: {url: string}[],
    isFeatured?: boolean,
    isArchived: boolean,
    category: string,
    industry: string,
    brand: string,
    model: string,
    year: string,
    createdAt: string
}
export const columns: ColumnDef<ProductColumns>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "price",
    header : "Price"
  },
  {
    accessorKey: "isFeatured",
    header : "Featured"
  },
  {
    accessorKey: "isArchived",
    header : "Archived"
  },
  {
    accessorKey: "category",
    header : "Category"
  },
  {
    accessorKey: "industry",
    header : "Industry"
  },
  {
    accessorKey: "brand",
    header : "Brand"
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell : ({row}) => {
      const stock = row.original.stock;

      return <p
      className={cn("text-lg font-semibold",
        (stock <= 5) ? "text-red-600 p-2 text-xs shadow-lg rounded-md  text-center overflow-x-auto " : "shadow-lg rounded-md overflow-x-auto p-2 text-xs text-gray-500"
      )}>{stock}</p>
    }
  },
  
  {
    accessorKey: "model",
    header : "Model"
  },
  {
    accessorKey: "year",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Year
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
