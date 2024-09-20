"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Billboards } from "@/types-db"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { CategoryColumns, columns } from "./columns"
import ApiList from "@/components/api_list"


interface CategoryClientProps {
  data: CategoryColumns[]
}

export const CategoryClient = ({data}: CategoryClientProps) => {
    const params = useParams()
    const router = useRouter()
  return (<>
  <div className="flex items-center justify-between">
    <Heading title={`Categories (${data.length})`}
    description="Manage Categories for your store"/>
    <Button onClick={() => router.push(`/${params.storeId}/categories/new`)}>
        <Plus className="h4 w-4 mr-2" />
        Add New
    </Button>
  </div>
  <Separator/>
  <DataTable columns={columns} data={data} searchKey="name"/>

  <Heading title="API" description="API calls for categories"/>
  <Separator/>

  <ApiList entityName="categories" entityId="categoryId"/>

  </>);
}
