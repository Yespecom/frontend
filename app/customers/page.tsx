"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Users, Eye, Search, Filter, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  totalSpent: number
  orderCount: number
  lastOrderDate: string
  createdAt: string
  updatedAt: string
  status?: string
}

interface CustomerProfile {
  customer: Customer
  orderHistory: Array<{
    _id: string
    orderId: string
    totalAmount: number
    status: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
    createdAt: string
  }>
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterAndSortCustomers()
  }, [customers, searchTerm, statusFilter, sortBy])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No authentication token found")
        return
      }
      const response = await fetch("https://api.yespstudio.com/api/admin/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      } else {
        console.error("Failed to fetch customers:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerProfile = async (customerId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No authentication token found")
        return
      }
      const response = await fetch(`https://api.yespstudio.com/api/admin/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedCustomer(data)
        setDialogOpen(true)
      } else {
        console.error("Failed to fetch customer profile:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching customer profile:", error)
    }
  }

  const filterAndSortCustomers = () => {
    let filtered = [...customers]
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm),
      )
    }
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((customer) => {
        const status = getCustomerStatus(customer)
        return status.toLowerCase() === statusFilter
      })
    }
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "highest-spent":
          return b.totalSpent - a.totalSpent
        case "lowest-spent":
          return a.totalSpent - b.totalSpent
        case "most-orders":
          return b.orderCount - a.orderCount
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    setFilteredCustomers(filtered)
  }

  const getCustomerStatus = (customer: Customer) => {
    if (customer.totalSpent > 10000) return "VIP"
    if (customer.orderCount === 0) return "New"
    if (new Date(customer.lastOrderDate) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) return "Inactive"
    return "Active"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VIP":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const exportCustomers = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Total Orders", "Total Spent", "Status", "Joined Date"].join(","),
      ...filteredCustomers.map((customer) =>
        [
          customer.name,
          customer.email,
          customer.phone,
          customer.orderCount,
          customer.totalSpent,
          getCustomerStatus(customer),
          formatDate(customer.createdAt),
        ].join(","),
      ),
    ].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-800"></div>
            <p className="text-gray-500 text-sm">Loading customers...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
            <p className="text-gray-600 text-sm">View and manage customer information</p>
          </div>
          <Button onClick={exportCustomers} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        {/* Filters and Search */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest-spent">Highest Spent</SelectItem>
                    <SelectItem value="lowest-spent">Lowest Spent</SelectItem>
                    <SelectItem value="most-orders">Most Orders</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Customers Table */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Users className="h-5 w-5 text-slate-800" />
              All Customers ({filteredCustomers.length})
              {searchTerm || statusFilter !== "all" ? (
                <span className="text-sm font-normal text-gray-500">of {customers.length} total</span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  {/* Animated Users Icon */}
                  <div className="animate-bounce">
                    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-10 w-10 text-slate-400" />
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
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {customers.length === 0 ? "No customers yet" : "No customers match your filters"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {customers.length === 0
                    ? "Your customers will appear here when they make their first purchase from your store."
                    : "Try adjusting your search terms or filters to find the customers you're looking for."}
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
                      <TableHead className="font-medium text-slate-700">Customer</TableHead>
                      <TableHead className="font-medium text-slate-700">Contact</TableHead>
                      <TableHead className="font-medium text-slate-700">Status</TableHead>
                      <TableHead className="font-medium text-slate-700">Orders</TableHead>
                      <TableHead className="font-medium text-slate-700">Total Spent</TableHead>
                      <TableHead className="font-medium text-slate-700">Last Order</TableHead>
                      <TableHead className="font-medium text-slate-700">Joined</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => {
                      const status = getCustomerStatus(customer)
                      return (
                        <TableRow key={customer._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-800">{customer.name}</p>
                              <p className="text-sm text-gray-500">{customer.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">{customer.phone}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {customer.orderCount} orders
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-slate-800">{formatCurrency(customer.totalSpent)}</span>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : "No orders"}
                          </TableCell>
                          <TableCell className="text-gray-600">{formatDate(customer.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => fetchCustomerProfile(customer._id)}
                              className="hover:bg-slate-100"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Customer Profile Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-xl font-semibold text-slate-900">Customer Profile</DialogTitle>
              <DialogDescription className="text-gray-600">View customer details and order history</DialogDescription>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6 pt-4">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-slate-800">{selectedCustomer.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-slate-800">{selectedCustomer.customer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-slate-800">{selectedCustomer.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(getCustomerStatus(selectedCustomer.customer))}`}
                        >
                          {getCustomerStatus(selectedCustomer.customer)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer Since</p>
                        <p className="font-medium text-slate-800">{formatDate(selectedCustomer.customer.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Order</p>
                        <p className="font-medium text-slate-800">
                          {selectedCustomer.customer.lastOrderDate
                            ? formatDate(selectedCustomer.customer.lastOrderDate)
                            : "No orders"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <p className="font-semibold text-slate-800">
                          {formatCurrency(selectedCustomer.customer.totalSpent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="font-medium text-slate-800">{selectedCustomer.customer.orderCount} orders</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Order History */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Order History</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedCustomer.orderHistory.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No orders found</p>
                      </div>
                    ) : (
                      selectedCustomer.orderHistory.map((order) => (
                        <div key={order._id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-slate-800">#{order.orderId}</p>
                              <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.name} × {item.quantity}
                                </span>
                                <span className="font-medium text-slate-800">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
