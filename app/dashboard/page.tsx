"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  AlertCircle,
  TrendingUp,
  Eye,
  ArrowUpRight,
  Calendar,
  Star,
  BarChart3,
  Plus,
  Settings,
  Tag,
  Percent,
  ExternalLink,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface DashboardData {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  lastOrder: string
  storeInfo: {
    name: string
    storeId: string
    isActive: boolean
  }
  user: {
    name: string
    email: string
    role: string
  }
}

interface AnalyticsData {
  monthlyRevenue: Array<{
    _id: { year: number; month: number }
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    _id: string
    totalSold: number
    revenue: number
    productName: string
  }>
}

interface StoreInfo {
  storeId: string
  storeName: string
  storeUrl: string
  adminUrl: string
  isActive: boolean
  owner: {
    name: string
    email: string
    phone: string
    role: string
  }
}

interface ApiStatus {
  dashboard: "loading" | "success" | "error"
  analytics: "loading" | "success" | "error"
  storeInfo: "loading" | "success" | "error"
}

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    dashboard: "loading",
    analytics: "loading",
    storeInfo: "loading",
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    setApiStatus({
      dashboard: "loading",
      analytics: "loading",
      storeInfo: "loading",
    })

    try {
      await Promise.allSettled([fetchDashboardData(), fetchAnalyticsData(), fetchStoreInfo()])
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/admin/login")
        return
      }

      console.log("🔄 Fetching dashboard stats...")
      const response = await fetch("https://api.yespstudio.com/api/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Dashboard stats response:", response.status)

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/admin/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Dashboard data received:", data)
        setDashboardData(data)
        setApiStatus((prev) => ({ ...prev, dashboard: "success" }))
      } else {
        console.warn("❌ Dashboard stats failed:", response.status)
        // Set fallback data for dashboard
        setDashboardData({
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          totalCustomers: 0,
          pendingOrders: 0,
          lastOrder: "",
          storeInfo: { name: "", storeId: "", isActive: false },
          user: { name: "Admin", email: "", role: "admin" },
        })
        setApiStatus((prev) => ({ ...prev, dashboard: "error" }))
      }
    } catch (error) {
      console.error("💥 Error fetching dashboard data:", error)
      setApiStatus((prev) => ({ ...prev, dashboard: "error" }))
      // Set fallback data
      setDashboardData({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        lastOrder: "",
        storeInfo: { name: "", storeId: "", isActive: false },
        user: { name: "Admin", email: "", role: "admin" },
      })
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Fetching analytics data...")

      const response = await fetch("https://api.yespstudio.com/api/admin/dashboard/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Analytics response:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Analytics data received:", data)
        setAnalyticsData(data)
        setApiStatus((prev) => ({ ...prev, analytics: "success" }))
      } else {
        console.warn("❌ Analytics failed:", response.status)
        setApiStatus((prev) => ({ ...prev, analytics: "error" }))
        // Set empty analytics data
        setAnalyticsData({
          monthlyRevenue: [],
          topProducts: [],
        })
      }
    } catch (error) {
      console.error("💥 Error fetching analytics data:", error)
      setApiStatus((prev) => ({ ...prev, analytics: "error" }))
      setAnalyticsData({
        monthlyRevenue: [],
        topProducts: [],
      })
    }
  }

  const fetchStoreInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Fetching store info...")

      const response = await fetch("https://api.yespstudio.com/api/admin/store-info", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Store info response:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Store info received:", data)
        setStoreInfo(data)
        setApiStatus((prev) => ({ ...prev, storeInfo: "success" }))
      } else {
        console.warn("❌ Store info failed:", response.status)
        setApiStatus((prev) => ({ ...prev, storeInfo: "error" }))
      }
    } catch (error) {
      console.error("💥 Error fetching store info:", error)
      setApiStatus((prev) => ({ ...prev, storeInfo: "error" }))
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[month - 1]
  }

  const quickActions = [
    {
      title: "Add Product",
      description: "Create a new product",
      icon: Plus,
      color: "bg-slate-50 text-slate-600",
      href: "/admin/products",
    },
    {
      title: "View Orders",
      description: "Manage customer orders",
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
      href: "/admin/orders",
    },
    {
      title: "Manage Categories",
      description: "Organize your products",
      icon: Tag,
      color: "bg-slate-50 text-slate-600",
      href: "/admin/categories",
    },
    {
      title: "Create Offer",
      description: "Add promotional offers",
      icon: Percent,
      color: "bg-green-50 text-green-600",
      href: "/admin/offers",
    },
    {
      title: "Store Settings",
      description: "Configure your store",
      icon: Settings,
      color: "bg-slate-50 text-slate-600",
      href: "/admin/settings",
    },
    {
      title: "View Storefront",
      description: "See your live store",
      icon: ExternalLink,
      color: "bg-slate-50 text-slate-600",
      href: storeInfo?.storeUrl || "#",
      external: true,
    },
  ]

  // Show loading state only if all APIs are still loading
  if (loading && Object.values(apiStatus).every((status) => status === "loading")) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-800"></div>
            <p className="text-slate-600 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6 bg-white">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 text-sm mt-1">
              Welcome back, <span className="font-semibold text-slate-900">{dashboardData?.user.name || "Admin"}</span>
            </p>
            {storeInfo && (
              <div className="flex items-center mt-3 space-x-3">
                <Badge
                  variant={storeInfo.isActive ? "default" : "secondary"}
                  className={`text-xs ${storeInfo.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                >
                  {storeInfo.isActive ? "Store Active" : "Store Inactive"}
                </Badge>
                <span className="text-xs text-slate-500">Store ID: {storeInfo.storeId}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {storeInfo?.storeUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(storeInfo.storeUrl, "_blank")}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Store
              </Button>
            )}
          </div>
        </div>

        {/* API Status Alerts */}
        {Object.values(apiStatus).some((status) => status === "error") && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Some dashboard features are temporarily unavailable</p>
                  <div className="text-xs text-yellow-700 mt-1 space-y-1">
                    {apiStatus.dashboard === "error" && <div>• Dashboard statistics service is down</div>}
                    {apiStatus.analytics === "error" && <div>• Analytics service is down</div>}
                    {apiStatus.storeInfo === "error" && <div>• Store information service is down</div>}
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    The backend team has been notified. Showing available data.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 text-xs bg-white"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Orders Alert */}
        {dashboardData?.pendingOrders > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {dashboardData.pendingOrders} pending orders require attention
                  </p>
                  <p className="text-xs text-green-700">Review and process them to keep customers happy</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100 text-xs bg-white"
                  onClick={() => router.push("/admin/orders")}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Orders
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className={`border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer bg-white ${apiStatus.dashboard === "error" ? "opacity-75" : ""}`}
            onClick={() => router.push("/admin/orders")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-slate-600 text-sm font-medium">Total Orders</p>
                    {apiStatus.dashboard === "error" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                  </div>
                  <p className="text-2xl font-bold mt-2 text-slate-900">{dashboardData?.totalOrders || 0}</p>
                  <p className="text-slate-500 text-xs mt-1">{dashboardData?.pendingOrders || 0} pending</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 bg-white ${apiStatus.dashboard === "error" ? "opacity-75" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                    {apiStatus.dashboard === "error" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                  </div>
                  <p className="text-2xl font-bold mt-2 text-slate-900">
                    {formatCurrency(dashboardData?.totalRevenue || 0)}
                  </p>
                  <div className="flex items-center text-green-600 text-xs mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    All time revenue
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer bg-white ${apiStatus.dashboard === "error" ? "opacity-75" : ""}`}
            onClick={() => router.push("/admin/products")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-slate-600 text-sm font-medium">Total Products</p>
                    {apiStatus.dashboard === "error" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                  </div>
                  <p className="text-2xl font-bold mt-2 text-slate-900">{dashboardData?.totalProducts || 0}</p>
                  <p className="text-slate-500 text-xs mt-1">Active products</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <Package className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer bg-white ${apiStatus.dashboard === "error" ? "opacity-75" : ""}`}
            onClick={() => router.push("/admin/customers")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-slate-600 text-sm font-medium">Total Customers</p>
                    {apiStatus.dashboard === "error" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                  </div>
                  <p className="text-2xl font-bold mt-2 text-slate-900">{dashboardData?.totalCustomers || 0}</p>
                  <p className="text-slate-500 text-xs mt-1">Registered customers</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100 bg-white pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
                <CardDescription className="text-slate-600 text-sm mt-1">Common tasks and shortcuts</CardDescription>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <Activity className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Card
                    key={index}
                    className="border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                    onClick={() => {
                      if (action.external) {
                        window.open(action.href, "_blank")
                      } else {
                        router.push(action.href)
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{action.title}</p>
                          <p className="text-xs text-slate-500">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue */}
          <Card
            className={`border border-gray-200 shadow-sm bg-white ${apiStatus.analytics === "error" ? "opacity-75" : ""}`}
          >
            <CardHeader className="border-b border-gray-100 bg-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xl font-bold text-slate-900">Monthly Revenue</CardTitle>
                    {apiStatus.analytics === "error" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <CardDescription className="text-slate-600 text-sm mt-1">
                    Revenue trends over the months
                  </CardDescription>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {analyticsData?.monthlyRevenue && analyticsData.monthlyRevenue.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.monthlyRevenue.slice(-6).map((month, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {getMonthName(month._id.month)} {month._id.year}
                          </p>
                          <p className="text-xs text-slate-500">{month.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-sm">{formatCurrency(month.revenue)}</p>
                        <div className="flex items-center text-green-600 text-xs">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    {apiStatus.analytics === "error" ? "Analytics temporarily unavailable" : "No revenue data"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {apiStatus.analytics === "error"
                      ? "Revenue analytics will be restored shortly"
                      : "Revenue analytics will appear here"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card
            className={`border border-gray-200 shadow-sm bg-white ${apiStatus.analytics === "error" ? "opacity-75" : ""}`}
          >
            <CardHeader className="border-b border-gray-100 bg-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xl font-bold text-slate-900">Top Products</CardTitle>
                    {apiStatus.analytics === "error" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <CardDescription className="text-slate-600 text-sm mt-1">Best performing products</CardDescription>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Star className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {analyticsData?.topProducts && analyticsData.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.topProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/products/${product._id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-slate-100 rounded-full">
                          <span className="text-xs font-bold text-slate-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 truncate max-w-[200px] text-sm">
                            {product.productName}
                          </p>
                          <p className="text-xs text-slate-500">{product.totalSold} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-sm">{formatCurrency(product.revenue)}</p>
                        <Badge className="text-xs bg-green-50 text-green-700 border-green-200 mt-1">Top Seller</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    {apiStatus.analytics === "error" ? "Product analytics temporarily unavailable" : "No product data"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {apiStatus.analytics === "error"
                      ? "Product analytics will be restored shortly"
                      : "Top products will appear here"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Store Status */}
        {storeInfo && (
          <Card
            className={`border border-gray-200 shadow-sm bg-white ${apiStatus.storeInfo === "error" ? "opacity-75" : ""}`}
          >
            <CardHeader className="border-b border-gray-100 bg-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xl font-bold text-slate-900">Store Status</CardTitle>
                    {apiStatus.storeInfo === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <CardDescription className="text-slate-600 text-sm mt-1">
                    Your store information and quick links
                  </CardDescription>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Activity className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-600">Store Name</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{storeInfo.storeName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Store ID</p>
                    <p className="text-sm font-mono text-slate-900 mt-1">{storeInfo.storeId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Status</p>
                    <Badge
                      variant={storeInfo.isActive ? "default" : "secondary"}
                      className={`text-xs mt-1 ${storeInfo.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                    >
                      {storeInfo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
                    onClick={() => window.open(storeInfo.storeUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Storefront
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
                    onClick={() => router.push("/admin/settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Store Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
