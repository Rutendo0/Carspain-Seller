"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CellAction } from "./cell-action"
import CellImage from "./cell-image"
import { cn } from "@/lib/utils"

export type StoreColumns = {
  id: string;
  name: string;
  number: string;
  address: string;
  store_owner: string;
  tax_clearance: string;
  createdAt: string,
  ownerID: string,
  userId: string 
}
export const columns: ColumnDef<StoreColumns>[] = [
  {
    accessorKey: "name",
    header: "Store Name"
  },
  {
    accessorKey: "number",
    header: "Store Phone"
  },
  {
    accessorKey: "address",
    header: "Store Address"
  },
  {
    accessorKey: "store_owner",
    header: "Owner"
  },
  {
    accessorKey: "tax_clearance",
    header: "Tax Cleared"
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
      const dateA :any = new Date(rowA.original.createdAt).getTime();
      const dateB: any = new Date(rowB.original.createdAt).getTime();
      return dateA - dateB;
    },
  },
  
  {
    id: "Actions",
    cell: ({row}) => <CellAction data={row.original} />
  }
]
