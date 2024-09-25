"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Billboards } from "@/types-db"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { ModelColumns, columns } from "./columns"
import ApiList from "@/components/api_list"


interface ModelClientProps {
  data: ModelColumns[]
}

export const ModelClient = ({data}: ModelClientProps) => {
    const params = useParams()
    const router = useRouter()
  return (<>
  <div className="flex items-center justify-between">
    <Heading title={`Models (${data.length})`}
    description="Manage Models for your store"/>
    <Button onClick={() => router.push(`/models/new`)}>
        <Plus className="h4 w-4 mr-2" />
        Add New
    </Button>
  </div>
  <Separator/>
  <DataTable columns={columns} data={data} searchKey="name"/>

  <Heading title="API" description="API calls for models"/>
  <Separator/>

  <ApiList entityName="models" entityId="modelId"/>

  </>);
}
