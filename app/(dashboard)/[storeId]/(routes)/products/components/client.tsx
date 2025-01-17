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
import emailjs from 'emailjs-com';
import toast from "react-hot-toast"

interface ProductClientProps {
  data: ProductColumns[],
  email: string| undefined,
  uname: string | null | undefined
}

export const ProductClient = ({data, email, uname}: ProductClientProps) => {
    const params = useParams()
    const router = useRouter()

    for(const x of data){
      if(x.stock < 5){
          emailjs.send("service_miw5uzq", "template_pclaerv", {
              to_email: email,
              message: `Your stock is running low for ${x.name}, ${x.model} ${x.brand}, ${x.year}. Please replenish to ensure product stays visible on the marketplace.`,
              from_name: "Carspian Auto",
              to_name: uname
            }, 'NgwZzNEQN_63SAnSw')
            .then((result) => {
            }, (error) => {
              console.log(error.text);
              toast.error('Failed to send email notification. Please contact admin.')})
      }
  }
  return (<>
  <div className="flex items-center justify-between">
    <Heading title={`Products (${data.length})`}
    description="Manage products for your store"/>
    <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
        <Plus className="h4 w-4 mr-2" />
        Add New
    </Button>
  </div>
  <Separator/>
  <DataTable columns={columns} data={data} searchKey="name"/>

  <Heading title="API" description="API calls for products"/>
  <Separator/>

  <ApiList entityName="products" entityId="productId"/>

  </>);
}
