import { getGraphRevenue } from "@/actions/get-graph-revenue";
import { getInventory } from "@/actions/get-inventory";
import { getRevenue } from "@/actions/get-revenue";
import { getOrders } from "@/actions/get-sales";
import { getStatusRevenue } from "@/actions/get-status-revenue";
import { Heading } from "@/components/heading";
import Overview from "@/components/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase";
import { Store } from "@/types-db";
import { doc, getDoc } from "firebase/firestore";
import { DollarSign } from "lucide-react";


interface DashboardOverviewProps {
}


const DashboardOverview = async () => {



    // const totalRevenue = await getRevenue();
    const tsales = await getOrders();
    const tproducts = await getInventory();
    const totalRevenue = await getGraphRevenue()

    const mgr = await getGraphRevenue()

    return(<div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your Store" />
        <Separator/>
        <div className="grid gap-4 grid-cols-4">
            <Card className="col-span-2">
                <CardHeader className="flex items-center justify-between flex-row">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue
                    </CardTitle>
                    <DollarSign className="w-4h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$: 345345</div>
                </CardContent>
            </Card>


            <Card className="col-span-1">
                <CardHeader className="flex items-center justify-between flex-row">
                    <CardTitle className="text-sm font-medium">
                        Sales
                    </CardTitle>
                    <DollarSign className="w-4h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{tsales}</div>
                </CardContent>
            </Card>


            <Card className="col-span-1">
                <CardHeader className="flex items-center justify-between flex-row">
                    <CardTitle className="text-sm font-medium">
                        Products
                    </CardTitle>
                    <DollarSign className="w-4h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{tproducts}</div>
                </CardContent>
            </Card>


            <Card className="col-span-3">
                <CardHeader className="flex items-center justify-between flex-row">
                    <CardTitle className="text-sm font-medium">
                        Revenue by Month
                    </CardTitle>
                    <DollarSign className="w-4h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Overview data={mgr}/>
                </CardContent>
            </Card>

            

           
        </div>
        </div>
    </div>)
}

export default DashboardOverview;