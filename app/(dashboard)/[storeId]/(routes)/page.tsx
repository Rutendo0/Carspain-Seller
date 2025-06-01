"use client"
import { getGraphRevenue } from "@/actions/get-graph-revenue";
import { getInventory } from "@/actions/get-inventory";
import { getRevenue } from "@/actions/get-revenue";
import { getOrders } from "@/actions/get-sales";
import { getStatusRevenue } from "@/actions/get-status-revenue";
import { getTopProducts } from "@/actions/get-top-products"; // New action
import { getCustomerAcquisition } from "@/actions/get-customer-acquisition"; // New action
import { Heading } from "@/components/heading";
import Overview from "@/components/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, PieChart } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPie, 
  Pie, 
  Cell,
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from "recharts";
import { getOrders2 } from "@/actions/orders";
import { format } from "date-fns";

interface DashboardOverviewProps {
  params: {storeId: string}; 
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

const DashboardOverview = async ({params}: DashboardOverviewProps) => {
  const totalRevenue = await getRevenue(params.storeId);
  const tsales = await getOrders(params.storeId);

  const orders = await getOrders2(params.storeId)
  const orderStatusData = Object.entries(
    orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  
  // Process order timeline data for line chart
  const orderTimelineData = Object.entries(
    orders.reduce((acc, order) => {
      const month = format(order.createdAt.toDate(), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, total]) => ({ name, total }));
  const tproducts = await getInventory(params.storeId);
  const mgr = await getGraphRevenue(params.storeId);
  const sgr = await getStatusRevenue(params.storeId);
//   const topProducts = await getTopProducts(params.storeId); // New data
//   const customerData = await getCustomerAcquisition(params.storeId); // New data

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">

        
        <Separator className="bg-indigo-100" />
        
        {/* Summary Cards */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm border-indigo-100 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-indigo-100 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">{tsales.toLocaleString()}</div>
              <p className="text-xs text-indigo-500 mt-1">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-indigo-100 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">Products in Stock</CardTitle>
              <Package className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">{tproducts.toLocaleString()}</div>
              <p className="text-xs text-indigo-500 mt-1">+5 new products</p>
            </CardContent>
          </Card>

        
        </div>

        {/* Main Charts Section */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Revenue Trend Chart */}
          <Card className="lg:col-span-2 shadow-sm border-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">Monthly Revenue Trend</CardTitle>
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent className="pl-0 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mgr}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="name"
                    stroke="#4f46e5"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                    stroke="#4f46e5"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      borderColor: '#e0e7ff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]} 
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Status Chart */}
          {/* <Card className="col-span-1">
                <CardHeader className="flex items-center justify-between flex-row">
                    <CardTitle className="text-sm font-medium">
                        Revenue by Payment Status
                    </CardTitle>
                    <DollarSign className="w-4h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Overview data={sgr}/>
                </CardContent>
            </Card> */}
        </div>

        {/* Additional Charts Section */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-4">
  {/* Order Status Pie Chart */}
  <Card className="shadow-sm border-indigo-100">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-indigo-800">Order Status Distribution</CardTitle>
      <PieChart className="h-4 w-4 text-indigo-600" />
    </CardHeader>
    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={orderStatusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {orderStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} orders`, 'Count']}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e0e7ff',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  {/* Order Timeline Line Chart */}
  <Card className="shadow-sm border-indigo-100">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-indigo-800">Order Creation Trend</CardTitle>
      <TrendingUp className="h-4 w-4 text-indigo-600" />
    </CardHeader>
    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={orderTimelineData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
          <XAxis 
            dataKey="name"
            stroke="#4f46e5"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#4f46e5"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff',
              borderColor: '#e0e7ff',
              borderRadius: '8px',
            }}
            formatter={(value) => [`${value} orders`, 'Count']}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#6366f1" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>
      </div>
    </div>
  )
}

export default DashboardOverview;