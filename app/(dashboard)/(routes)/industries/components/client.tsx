"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Billboards } from "@/types-db"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { IndustryColumns, columns } from "./columns"
import ApiList from "@/components/api_list"


interface IndustryClientProps {
  data: IndustryColumns[]
}

export const IndustryClient = ({data}: IndustryClientProps) => {
    const params = useParams()
    const router = useRouter()
  return (<>
  <div className="flex items-center justify-between">
    <Heading title={`Industries (${data.length})`}
    description="Manage Industries for your store"/>
    <Button onClick={() => router.push(`/${params.storeId}/industries/new`)}>
        <Plus className="h4 w-4 mr-2" />
        Add New
    </Button>
  </div>
  <Separator/>
  <DataTable columns={columns} data={data} searchKey="name"/>

  <Heading title="API" description="API calls for Industries"/>
  <Separator/>

  <ApiList entityName="industries" entityId="industryId"/>

  </>);
}
