"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Billboards } from "@/types-db"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { OrderColumns, columns } from "./columns"
import ApiList from "@/components/api_list"


interface OrderClientProps {
  data: OrderColumns[]
}

export const OrderClient = ({data}: OrderClientProps) => {
    const params = useParams()
    const router = useRouter()
  return (<>
  <div className="flex items-center justify-between">
    <Heading title={`Orders (${data.length})`}
    description="Manage all orders on the platform!"/>
    
  </div>
  <Separator/>
  <DataTable columns={columns} data={data} searchKey="name"/>



  </>);
}
