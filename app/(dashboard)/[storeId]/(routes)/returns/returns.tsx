"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Order, ReturnData } from "@/types-db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronLeft, ChevronRight, Circle, ClipboardList, FileText, ImageIcon, Loader2, ShoppingCart, User, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ReturnsPageProps {
  initialData: ReturnData[];
  storeId: string;
}

const ReturnsPage = ({ initialData, storeId }: ReturnsPageProps) => {
  const [returns, setReturns] = useState<ReturnData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  // Columns configuration (same as before)
  const columns: ColumnDef<ReturnData>[] = [
    {
      accessorKey: "id",
      header: "Return ID",
    },
    {
      accessorKey: "orderId",
      header: "Order ID",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          row.getValue("status") === "pending" 
            ? "bg-yellow-100 text-yellow-800" 
            : row.getValue("status") === "approved" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
        }`}>
          {row.getValue("status")}
        </span>
      )
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
          const timestamp = row.getValue("createdAt") as { toDate: () => Date } | Date | string;
          const date = typeof timestamp === 'object' && 'toDate' in timestamp 
            ? timestamp.toDate() 
            : new Date(timestamp);
          
          return <span>{date.toLocaleDateString()}</span>;
        }
      },
    {
      accessorKey: "description",
      header: "Reason",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.getValue("description")}
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewReturn(row.original)}
        >
          View Details
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!selectedReturn) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/single/${selectedReturn.orderId}`);
        const data = await response.json();
        
        console.log(data)
        if (data) {
          setOrderDetails(data);
        } else {
          setOrderDetails(null);
          toast.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [selectedReturn, storeId]);

  const handleViewReturn = (returnData: ReturnData) => {
    setSelectedReturn(returnData);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedReturn(null);
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedReturn) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/returns/${selectedReturn.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response) {
        setReturns(prev => prev.map(ret => 
          ret.id === selectedReturn.id ? { ...ret, status: newStatus } : ret
        ));
        setSelectedReturn({ ...selectedReturn, status: newStatus });
        toast.success(`Return ${newStatus} successfully`);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error("Error updating return status:", error);
      toast.error("Failed to update return status");
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (selectedReturn?.images) {
      setCurrentImageIndex(prev => 
        prev === selectedReturn.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedReturn?.images) {
      setCurrentImageIndex(prev => 
        prev === 0 ? selectedReturn.images.length - 1 : prev - 1
      );
    }
  };

  const refreshReturns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/returns?storeId=${storeId}`);
      const data = await response.json();
      setReturns(data);
    } catch (error) {
      console.error("Error refreshing returns:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ... your existing header and DataTable ... */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Returns Management</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshReturns}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={returns} 
        searchKey="id" 
      />
      {/* Return Details Modal */}
      <Dialog open={!!selectedReturn} onOpenChange={closeModal}>
  <DialogContent className="max-w-4xl p-0 overflow-hidden">
    <DialogHeader className="border-b px-6 py-4">
      <DialogTitle className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Return Request</h2>
          <p className="text-sm text-gray-500 mt-1">Order #{selectedReturn?.orderId}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={closeModal}
          className="rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </DialogTitle>
    </DialogHeader>

    {selectedReturn && (
      <div className="space-y-6 p-6 overflow-y-auto max-h-[70vh]">
        {/* Status and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
              selectedReturn.status === "pending" 
                ? "bg-yellow-100 text-yellow-800" 
                : selectedReturn.status === "approved" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
            }`}>
              <Circle className="h-2 w-2" />
              Status: {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
            </div>
          </div>
          
          {selectedReturn.status === "pending" && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => handleStatusUpdate('approved')}
                disabled={loading}
                className="min-w-[120px] hover:bg-green-50 hover:text-green-700 border-green-200"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleStatusUpdate('rejected')}
                disabled={loading}
                className="min-w-[120px]"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>

        {/* Return Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-800">Customer Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">User ID</span>
                  <span className="text-sm font-medium">{selectedReturn.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Request Date</span>
                  <span className="text-sm font-medium">
                    {new Date(
                      typeof selectedReturn.createdAt === 'object' && 'toDate' in selectedReturn.createdAt 
                        ? selectedReturn.createdAt.toDate() 
                        : selectedReturn.createdAt
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Return Reason */}
            <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-800">Return Reason</h3>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-md">
                {selectedReturn.description || "No reason provided"}
              </p>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">Evidence Photos</h3>
            </div>
            {selectedReturn.images.length > 0 ? (
              <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group">
                <Image
                  src={selectedReturn.images[currentImageIndex]}
                  alt={`Return evidence ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                />
                
                {/* Navigation Arrows */}
                {selectedReturn.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs shadow-md">
                  {currentImageIndex + 1} / {selectedReturn.images.length}
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-md flex flex-col items-center justify-center gap-2 text-gray-500">
                <ImageIcon className="h-8 w-8" />
                <p>No images provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">Order Items</h3>
          </div>
          {orderDetails ? (
            <div className="border rounded-md divide-y">
              {orderDetails.orderItems?.map((item, index) => (
                <div 
                  key={index} 
                  className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.brand && `${item.brand}, `}{item.model}
                    </p>
                  </div>
                  <p className="font-medium text-gray-800">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500 mr-2" />
              <p className="text-gray-500">Loading order details...</p>
            </div>
          )}
        </div>

        
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
};

export default ReturnsPage;