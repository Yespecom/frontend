"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Eye, Package, User, MapPin, CreditCard, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import InvoiceDocument from "@/components/invoice-document"
import LabelDocument from "@/components/label-document"
import { printDocument } from "@/lib/print-utils" // Updated import path

interface Order {
  _id: string
  orderNumber: string
  customerId: string // Added customerId based on sample data
  customerInfo: {
    name: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  items: Array<{
    productId: string // This will be populated with product details
    name: string
    price: number
    quantity: number
    total: number
    _id: string // Added _id for item based on sample data
  }>
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Shop information (placeholder - update with your actual shop details)
const shopInfo = {
  name: "YesP Studio",
  address: {
    street: "456 Commerce St",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "600001",
    country: "India",
  },
  phone: "+919876543210",
  email: "info@yespstudio.com",
  website: "www.yespstudio.com",
}

// Re-exporting formatters for use in print components
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://api.yespstudio.com/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch orders. Please check your authentication.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`https://api.yespstudio.com/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        toast({
          title: "Order updated",
          description: `Order status changed to ${newStatus}`,
        })
        fetchOrders()
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "confirmed":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "shipped":
        return "bg-purple-50 text-purple-700 border border-purple-200"
      case "delivered":
        return "bg-green-50 text-green-700 border border-green-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    return status.toLowerCase() === "success" || status.toLowerCase() === "paid"
      ? "bg-green-50 text-green-700 border border-green-200"
      : "bg-red-50 text-red-700 border border-red-200"
  }

  const handlePrintInvoice = () => {
    if (selectedOrder) {
      printDocument(
        InvoiceDocument,
        { order: selectedOrder, shopInfo },
        { title: `Invoice - ${selectedOrder.orderNumber}` },
      )
    }
  }

  const handlePrintLabel = () => {
    if (selectedOrder) {
      printDocument(
        LabelDocument,
        { order: selectedOrder, shopInfo },
        { title: `Shipping Label - ${selectedOrder.orderNumber}` },
      )
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-800"></div>
            <p className="text-gray-500 text-sm">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="text-gray-600 text-sm">Manage customer orders and fulfillment</p>
        </div>

        {/* Orders Table */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <ShoppingCart className="h-5 w-5 text-slate-800" />
              All Orders ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  {/* Animated Shopping Cart */}
                  <div className="animate-bounce">
                    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart className="h-10 w-10 text-slate-400" />
                    </div>
                  </div>
                  {/* Floating Elements Animation */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                    <div className="animate-pulse">
                      <div className="w-2 h-2 bg-slate-300 rounded-full absolute -top-8 -left-8 animate-ping"></div>
                      <div
                        className="w-1 h-1 bg-slate-400 rounded-full absolute -top-4 left-8 animate-ping"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-slate-300 rounded-full absolute -top-6 left-12 animate-ping"
                        style={{ animationDelay: "1s" }}
                      ></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Your orders will appear here when customers start making purchases from your store.
                </p>
                {/* Animated Waiting Dots */}
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-medium text-slate-700">Order ID</TableHead>
                      <TableHead className="font-medium text-slate-700">Customer</TableHead>
                      <TableHead className="font-medium text-slate-700">Items</TableHead>
                      <TableHead className="font-medium text-slate-700">Amount</TableHead>
                      <TableHead className="font-medium text-slate-700">Status</TableHead>
                      <TableHead className="font-medium text-slate-700">Payment</TableHead>
                      <TableHead className="font-medium text-slate-700">Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="font-mono font-medium text-slate-800">#{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800">{order.customerInfo.name}</p>
                            <p className="text-sm text-gray-500">{order.customerInfo.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-700">
                            <Package className="h-4 w-4 text-slate-500" />
                            <span>
                              {order.items.length} item{order.items.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-slate-800">{formatCurrency(order.total)}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-slate-700">{order.paymentMethod}</p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Dialog open={dialogOpen && selectedOrder?._id === order._id} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setDialogOpen(true)
                                }}
                                className="hover:bg-slate-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader className="border-b border-gray-200 pb-4">
                                <DialogTitle className="text-xl font-semibold text-slate-900">
                                  Order Details - #{selectedOrder?.orderNumber}
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                  View and manage order information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6 pt-4">
                                  {/* Customer Info */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <User className="h-4 w-4 text-slate-600" />
                                      <h3 className="font-semibold text-slate-900">Customer Information</h3>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-500">Name</p>
                                          <p className="font-medium text-slate-800">
                                            {selectedOrder.customerInfo.name}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">Email</p>
                                          <p className="font-medium text-slate-800">
                                            {selectedOrder.customerInfo.email}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">Phone</p>
                                          <p className="font-medium text-slate-800">
                                            {selectedOrder.customerInfo.phone}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            Address
                                          </p>
                                          <p className="font-medium text-slate-800">
                                            {selectedOrder.customerInfo.address.street},{" "}
                                            {selectedOrder.customerInfo.address.city},{" "}
                                            {selectedOrder.customerInfo.address.state} -{" "}
                                            {selectedOrder.customerInfo.address.zipCode},{" "}
                                            {selectedOrder.customerInfo.address.country}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Order Items */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <Package className="h-4 w-4 text-slate-600" />
                                      <h3 className="font-semibold text-slate-900">Order Items</h3>
                                    </div>
                                    <div className="space-y-3">
                                      {selectedOrder.items.map((item, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
                                        >
                                          <div className="flex items-center gap-3">
                                            {/* Placeholder for product image as it's not in the item directly */}
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                              <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div>
                                              <p className="font-medium text-slate-800">{item.name}</p>
                                              <p className="text-sm text-gray-600">
                                                Qty: {item.quantity} × {formatCurrency(item.price)}
                                              </p>
                                            </div>
                                          </div>
                                          <p className="font-semibold text-slate-800">{formatCurrency(item.total)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Order Summary */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <CreditCard className="h-4 w-4 text-slate-600" />
                                      <h3 className="font-semibold text-slate-900">Order Summary</h3>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Subtotal:</span>
                                          <span className="font-semibold text-slate-800">
                                            {formatCurrency(selectedOrder.subtotal)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Tax:</span>
                                          <span className="font-semibold text-slate-800">
                                            {formatCurrency(selectedOrder.tax)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Shipping:</span>
                                          <span className="font-semibold text-slate-800">
                                            {formatCurrency(selectedOrder.shipping)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Discount:</span>
                                          <span className="font-semibold text-slate-800">
                                            {formatCurrency(selectedOrder.discount)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Total Amount:</span>
                                          <span className="font-semibold text-slate-800">
                                            {formatCurrency(selectedOrder.total)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Payment Method:</span>
                                          <span className="font-medium text-slate-800">
                                            {selectedOrder.paymentMethod}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Payment Status:</span>
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                                          >
                                            {selectedOrder.paymentStatus}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Order Date:</span>
                                          <span className="font-medium text-slate-800">
                                            {formatDate(selectedOrder.createdAt)}
                                          </span>
                                        </div>
                                        {selectedOrder.notes && (
                                          <div className="col-span-full">
                                            <span className="text-gray-600">Notes:</span>
                                            <span className="font-medium text-slate-800 ml-2">
                                              {selectedOrder.notes}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {/* Status Update */}
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">Update Order Status</h3>
                                    <Select
                                      value={selectedOrder.status}
                                      onValueChange={(value) => updateOrderStatus(selectedOrder._id, value)}
                                    >
                                      <SelectTrigger className="bg-white border border-gray-300">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {/* Print Buttons */}
                                  <div className="flex gap-4 justify-end border-t border-gray-200 pt-4">
                                    <Button variant="outline" onClick={handlePrintInvoice}>
                                      <Printer className="h-4 w-4 mr-2" />
                                      Print Invoice
                                    </Button>
                                    <Button variant="outline" onClick={handlePrintLabel}>
                                      <Printer className="h-4 w-4 mr-2" />
                                      Print Label
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
