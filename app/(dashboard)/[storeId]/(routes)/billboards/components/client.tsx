"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Billboards } from "@/types-db"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { BillboardColumns, columns } from "./columns"
import ApiList from "@/components/api_list"


interface BillboardClientProps {
  data: BillboardColumns[]
}

export const BillboardClient = ({data}: BillboardClientProps) => {
    const params = useParams()
    const router = useRouter()
  return (<>
  <div className="flex items-center justify-between">
    <Heading title={`Billboards (${data.length})`}
    description="Manage Billboards for your store"/>
    <Button onClick={() => router.push(`/${params.storeId}/billboards/new`)}>
        <Plus className="h4 w-4 mr-2" />
        Add New
    </Button>
  </div>
  <Separator/>
  <DataTable columns={columns} data={data} searchKey="label"/>
  <Heading title="API" description="API calls for billboards"/>
  <Separator/>

  <ApiList entityName="billboards" entityId="billboardId"/>
  </>);
}
