"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellImage } from "./cell-image"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CellAction } from "./cell-action"

export type BillboardColumns = {
    id: string,
    label: string,
    imageUrl: string,
    createdAt: string
}
export const columns: ColumnDef<BillboardColumns>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({row}) => {
        const {imageUrl} = row.original
        return (
            <CellImage imageUrl={imageUrl}/>
        )
    }
  },
  {
    accessorKey: "label",
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
