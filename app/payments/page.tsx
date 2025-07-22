"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CreditCard, DollarSign, TrendingUp, ArrowUpRight, Download, RefreshCw, AlertTriangle } from "lucide-react"

interface Payment {
  _id: string
  paymentId: string
  orderId: string
  amount: number
  method: string
  status: string
  gatewayResponse: any
  createdAt: string
  updatedAt: string
}

interface PaymentSummary {
  todayRevenue: number
  monthRevenue: number
  totalRevenue: number
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.yespstudio.com"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<PaymentSummary>({
    todayRevenue: 0,
    monthRevenue: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetchPayments()
    fetchPaymentSummary()
  }, [])

  const fetchPayments = async () => {
    try {
      setError("")
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log("🔍 Fetching payments from:", `${API_BASE_URL}/api/admin/payments`)

      const response = await fetch(`${API_BASE_URL}/api/admin/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Payments response status:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ Payments fetch failed:", errorData)
        throw new Error(`Failed to fetch payments: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Payments data received:", data)

      setPayments(data.payments || [])
    } catch (error) {
      console.error("❌ Error fetching payments:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch payments")
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentSummary = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log("📊 Fetching payment summary from:", `${API_BASE_URL}/api/admin/payments/summary`)

      const response = await fetch(`${API_BASE_URL}/api/admin/payments/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Summary response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Summary data received:", data)
        setSummary({
          todayRevenue: data.todayRevenue || 0,
          monthRevenue: data.monthRevenue || 0,
          totalRevenue: data.totalRevenue || 0,
        })
      } else {
        console.error("⚠️ Failed to fetch payment summary:", response.status)
      }
    } catch (error) {
      console.error("❌ Error fetching payment summary:", error)
    }
  }

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/payments/export/csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `payments_export_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error("Failed to export payments")
      }
    } catch (error) {
      console.error("❌ Export error:", error)
      alert("Failed to export payments. Please try again.")
    }
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-50 text-green-700 border border-green-200"
      case "failed":
        return "bg-red-50 text-red-700 border border-red-200"
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "cancelled":
        return "bg-gray-50 text-gray-700 border border-gray-200"
      case "refunded":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "card":
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-4 w-4 text-slate-500" />
      case "upi":
        return (
          <div className="w-4 h-4 bg-orange-500 rounded text-xs text-white flex items-center justify-center font-bold">
            U
          </div>
        )
      case "netbanking":
        return (
          <div className="w-4 h-4 bg-blue-500 rounded text-xs text-white flex items-center justify-center font-bold">
            N
          </div>
        )
      case "wallet":
        return (
          <div className="w-4 h-4 bg-purple-500 rounded text-xs text-white flex items-center justify-center font-bold">
            W
          </div>
        )
      case "cod":
        return <DollarSign className="h-4 w-4 text-slate-500" />
      default:
        return <CreditCard className="h-4 w-4 text-slate-500" />
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-800"></div>
            <p className="text-gray-500 text-sm">Loading payments...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Error Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed to load payments</p>
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoading(true)
                    fetchPayments()
                    fetchPaymentSummary()
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-100 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
            <p className="text-gray-600 text-sm">Track payment transactions and revenue analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                fetchPayments()
                fetchPaymentSummary()
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-700">Today's Revenue</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.todayRevenue)}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>Revenue earned today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-700">This Month</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.monthRevenue)}</div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>Revenue this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-700">Total Revenue</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.totalRevenue)}</div>
              <div className="flex items-center text-xs text-purple-600 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>All time revenue</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <CreditCard className="h-5 w-5 text-slate-800" />
              Payment Transactions ({payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  {/* Animated CreditCard Icon */}
                  <div className="animate-bounce">
                    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <CreditCard className="h-10 w-10 text-slate-400" />
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
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No payments yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Payment transactions will appear here when customers start making purchases from your store.
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
                      <TableHead className="font-medium text-slate-700">Payment ID</TableHead>
                      <TableHead className="font-medium text-slate-700">Order ID</TableHead>
                      <TableHead className="font-medium text-slate-700">Amount</TableHead>
                      <TableHead className="font-medium text-slate-700">Method</TableHead>
                      <TableHead className="font-medium text-slate-700">Status</TableHead>
                      <TableHead className="font-medium text-slate-700">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell>
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-slate-800">
                            {payment.paymentId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-800">#{payment.orderId}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-slate-800">{formatCurrency(payment.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.method)}
                            <span className="text-slate-700 capitalize">{payment.method.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(payment.createdAt)}</TableCell>
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
