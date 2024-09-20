"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Billboards } from "@/types-db"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { ProductColumns, columns } from "./columns"
import ApiList from "@/components/api_list"


interface ProductClientProps {
  data: ProductColumns[]
}

export const ProductClient = ({data}: ProductClientProps) => {
    const params = useParams()
    const router = useRouter()
  return (<>
  <div className="flex items-center justify-between">
    <Heading title={`Products (${data.length})`}
    description="All the products from every store on the platform"/>
  </div>
  <Separator/>
  <DataTable columns={columns} data={data} searchKey="name"/>


  </>);
}
