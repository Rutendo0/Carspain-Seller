"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { OrderColumns, columns } from "./columns"

interface OrderClientProps {
  data: OrderColumns[]
}

export const OrderClient = ({ data }: OrderClientProps) => {
  const params = useParams()
  const router = useRouter()

  // Filter data based on approval status
  const pendingOrders = data.filter(order => order.approved !== "Approved")
  const approvedOrders = data.filter(order => order.approved === "Approved")
  const completeOrders = data.filter(order => order.approved === "Complete")

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title="Orders" 
          description="Manage orders for your store"
        />
      </div>
      <Separator className="my-4" />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="complete">
            Complete ({completeOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <DataTable 
            columns={columns} 
            data={pendingOrders} 
            searchKey="phone"
          />
        </TabsContent>

        <TabsContent value="approved">
          <DataTable 
            columns={columns} 
            data={approvedOrders} 
            searchKey="phone"
          />
        </TabsContent>

        <TabsContent value="complete">
          <DataTable 
            columns={columns} 
            data={completeOrders} 
            searchKey="phone"
          />
        </TabsContent>
      </Tabs>
    </>
  )
}