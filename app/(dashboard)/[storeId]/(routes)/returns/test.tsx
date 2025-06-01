"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { ReturnData, Order } from "@/types-db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

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

  // Fetch order details when a return is selected
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!selectedReturn) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/stores/${storeId}/orders?orderId=${selectedReturn.orderId}`);
        const data = await response.json();
        
        if (response.ok && data.length > 0) {
          setOrderDetails(data[0]);
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

  // ... (keep your existing columns and other functions)
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


  const handleViewReturn = (returnData: ReturnData) => {
    setSelectedReturn(returnData);
    setCurrentImageIndex(0);
  };

  // ... (keep your other existing functions)
  const closeModal = () => {
    setSelectedReturn(null);
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedReturn) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/returns/${selectedReturn.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
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
      const response = await fetch(`/api/returns?storeId=${storeId}`);
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
      {/* ... (keep your existing header and DataTable) */}
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
        searchKey="originalOrder.id" 
      />
      {/* Return Details Modal */}
      <Dialog open={!!selectedReturn} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Return Details (Order #{selectedReturn?.orderId})</span>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-6">
              {/* ... (keep your status and actions section) */}
              <div className="flex justify-between items-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedReturn.status === "pending" 
                    ? "bg-yellow-100 text-yellow-800" 
                    : selectedReturn.status === "approved" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                }`}>
                  Status: {selectedReturn.status}
                </div>
                
                {selectedReturn.status === "pending" && (
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
              {/* Return Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">User ID:</span> {selectedReturn.userId}</p>
                    <p><span className="font-medium">Order Date:</span> {new Date(
                      typeof selectedReturn.createdAt === 'object' && 'toDate' in selectedReturn.createdAt 
                        ? selectedReturn.createdAt.toDate() 
                        : selectedReturn.createdAt
                    ).toLocaleString()}</p>
                  </div>

                  <h3 className="font-semibold mt-4 mb-2">Return Reason</h3>
                  <p className="whitespace-pre-line bg-gray-50 p-3 rounded-md">
                    {selectedReturn.description}
                  </p>
                </div>

                {/* ... (keep your image carousel section) */}
                <div>
                  <h3 className="font-semibold mb-2">Evidence Photos</h3>
                  {selectedReturn.images.length > 0 ? (
                    <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 px-2 py-1 rounded-full text-xs">
                        {currentImageIndex + 1} / {selectedReturn.images.length}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                      <p>No images provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items - Now fetched separately */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                {orderDetails ? (
                  <div className="border rounded-md divide-y">
                    {orderDetails.orderItems?.map((item, index) => (
                      <div key={index} className="p-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.brand}, {item.model}</p>
                        </div>
                        <p>${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Loading order details...</p>
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