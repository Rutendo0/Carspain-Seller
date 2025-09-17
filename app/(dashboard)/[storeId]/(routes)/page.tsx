"use client"

import { useState, useEffect } from "react";
import { getGraphRevenue } from "@/actions/get-graph-revenue";
import { getInventory } from "@/actions/get-inventory";
import { getRevenue } from "@/actions/get-revenue";
import { getOrders } from "@/actions/get-sales";
import { getStatusRevenue } from "@/actions/get-status-revenue";
import { getTopProducts } from "@/actions/get-top-products";
import { getCustomerAcquisition } from "@/actions/get-customer-acquisition";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";



const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

const DashboardOverview = () => {
  const params = useParams();
  const storeId = (params?.storeId as string) || "";
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [tsales, setTsales] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [tproducts, setTproducts] = useState(0);
  const [mgr, setMgr] = useState<any[]>([]);
  const [sgr, setSgr] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          revenueData, 
          salesData, 
          ordersData, 
          inventoryData, 
          graphRevenueData,
          statusRevenueData
        ] = await Promise.all([
          getRevenue(storeId),
          getOrders(storeId),
          getOrders2(storeId),
          getInventory(storeId),
          getGraphRevenue(storeId),
          getStatusRevenue(storeId)
        ]);

        setTotalRevenue(revenueData);
        setTsales(salesData);
        setOrders(ordersData);
        setTproducts(inventoryData);
        setMgr(graphRevenueData);
        setSgr(statusRevenueData);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  const orderStatusData = Object.entries(
    orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  
  const orderTimelineData = Object.entries(
    orders.reduce((acc, order) => {
      const month = format(new Date(order.createdAt.seconds * 1000), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, total]) => ({ name, total }));

  if (loading) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <Separator className="bg-indigo-100" />
          
          {/* Summary Cards Skeleton */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-sm border-indigo-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-3/4 mt-2" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="lg:col-span-2 shadow-sm border-indigo-100">
              <CardHeader>
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="h-[350px]">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-4">
            {[1, 2].map((i) => (
              <Card key={i} className="shadow-sm border-indigo-100">
                <CardHeader>
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="h-[300px]">
                  <Skeleton className="h-full w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
          <div className="w-full border rounded-lg bg-white shadow-sm p-6 flex flex-col items-center justify-center gap-4">
            <p className="text-red-500 text-lg">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

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
        </div>

        {/* Additional Charts Section */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-4">
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