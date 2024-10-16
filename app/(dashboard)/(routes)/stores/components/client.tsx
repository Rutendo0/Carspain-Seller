"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Billboards, Store } from "@/types-db"
import { Phone, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { StoreColumns, columns } from "./columns"
import ApiList from "@/components/api_list"
import toast from "react-hot-toast"


interface OrderClientProps {
  data: StoreColumns[]
}

export const StoreClient = ({data}: OrderClientProps) => {
    const params = useParams()
    const router = useRouter()

  return (<>
  <div className="flex items-center justify-between">
    <Heading title={`Shops (${data.length})`}
    description="Manage all shops on the platform!"/>

  </div>
  <Separator/>
  <DataTable columns={columns} data={data} searchKey="name"/>



  </>);
}
