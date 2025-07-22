"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Gift,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  X,
  AlertTriangle,
} from "lucide-react"

interface Offer {
  _id: string
  name?: string // Keep for backward compatibility
  title?: string // New field name
  type: string
  value: number
  minOrderAmount?: number // Frontend field name
  minOrderValue?: number // Server field name
  maxDiscount?: number
  validFrom?: string // Keep for backward compatibility
  validTo?: string // Keep for backward compatibility
  startDate?: string // New field name
  endDate?: string // New field name
  isActive: boolean
  isPublic?: boolean
  usageLimit?: number
  usedCount?: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  createdAt: string
  updatedAt: string
}

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.yespstudio.com"

// Professional Toast Notification Component
function ToastNotification({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 5000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-white border-l-4 border-green-500 shadow-lg"
      case "error":
        return "bg-white border-l-4 border-red-500 shadow-lg"
      case "warning":
        return "bg-white border-l-4 border-yellow-500 shadow-lg"
      case "info":
        return "bg-white border-l-4 border-blue-500 shadow-lg"
      default:
        return "bg-white border-l-4 border-gray-500 shadow-lg"
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className={`${getToastStyles()} rounded-lg p-4 mb-3 animate-in slide-in-from-right-full duration-300`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
          {toast.description && <p className="text-sm text-gray-600 mt-1">{toast.description}</p>}
        </div>
        <button onClick={() => onRemove(toast.id)} className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Container Component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [apiErrors, setApiErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    validFrom: "",
    validTo: "",
    usageLimit: "",
  })

  // Helper function to safely convert to string with fallback
  const safeToString = (value: any, fallback = ""): string => {
    if (value === null || value === undefined) return fallback
    return String(value)
  }

  // Helper function to safely get numeric value
  const safeNumericValue = (value: any, fallback = 0): number => {
    if (value === null || value === undefined) return fallback
    const num = Number(value)
    return isNaN(num) ? fallback : num
  }

  // Helper function to get minimum order amount (handles both field names)
  const getMinOrderAmount = (offer: Offer): number => {
    return safeNumericValue(offer.minOrderAmount || offer.minOrderValue, 0)
  }

  // Toast functions
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const showToast = (title: string, description?: string, type: Toast["type"] = "info") => {
    addToast({ title, description, type })
  }

  // Enhanced API error handling
  const handleApiError = (endpoint: string, response: Response, data?: any): string => {
    console.error(`❌ API Error for ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      data,
    })

    let errorMessage = "Something went wrong. Please try again."

    switch (response.status) {
      case 400:
        errorMessage = data?.error || data?.message || "Bad request. Please check your data."
        break
      case 401:
        errorMessage = "Authentication failed. Please log in again."
        localStorage.removeItem("token")
        router.push("/login")
        break
      case 403:
        errorMessage = "You don't have permission to perform this action."
        break
      case 404:
        errorMessage = "The requested resource was not found."
        break
      case 409:
        errorMessage = data?.error || "Conflict. Resource already exists."
        break
      case 422:
        errorMessage = data?.error || "Validation failed. Please check your input."
        break
      case 429:
        errorMessage = "Too many requests. Please wait a moment and try again."
        break
      case 500:
        errorMessage = "Server error. Please try again later."
        break
      case 502:
        errorMessage = "Bad gateway. The server is temporarily unavailable."
        break
      case 503:
        errorMessage = "Service unavailable. Please try again later."
        break
      default:
        errorMessage = `Request failed with status ${response.status}. Please try again.`
    }

    return errorMessage
  }

  // Enhanced API request function with retry logic
  const makeApiRequest = async (
    url: string,
    options: RequestInit = {},
    retries = 2,
  ): Promise<{ response: Response; data: any }> => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found. Please log in.")
    }

    const defaultOptions: RequestInit = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    console.log(`🚀 Making API request to: ${url}`)

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, defaultOptions)
        const responseText = await response.text()

        let data
        try {
          data = responseText ? JSON.parse(responseText) : {}
        } catch (parseError) {
          console.error(`❌ JSON parse error:`, parseError)
          if (response.ok) {
            data = {}
          } else {
            throw new Error(`Invalid JSON response: ${responseText}`)
          }
        }

        if (!response.ok) {
          const errorMessage = handleApiError(url, response, data)
          if (attempt === retries) {
            throw new Error(errorMessage)
          }
          console.log(`🔄 Retrying request (attempt ${attempt + 1}/${retries})...`)
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }

        console.log(`✅ Request successful:`, data)
        return { response, data }
      } catch (error) {
        console.error(`❌ Request failed (attempt ${attempt + 1}):`, error)
        if (attempt === retries) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }

    throw new Error("Max retries exceeded")
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setApiErrors((prev) => ({ ...prev, offers: "" }))
      const { data } = await makeApiRequest(`${API_BASE_URL}/api/admin/offers`)
      setOffers(Array.isArray(data) ? data : [])
      console.log(`✅ Loaded ${Array.isArray(data) ? data.length : 0} offers`)
    } catch (error) {
      console.error("❌ Error fetching offers:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch offers"
      setApiErrors((prev) => ({ ...prev, offers: errorMessage }))
      showToast("Error Loading Offers", errorMessage, "error")
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Enhanced validation
    if (!formData.name.trim()) {
      showToast("Validation Error", "Offer name is required.", "error")
      return
    }

    if (!formData.value || Number(formData.value) <= 0) {
      showToast("Validation Error", "Discount value must be greater than 0.", "error")
      return
    }

    if (formData.type === "percentage" && Number(formData.value) > 100) {
      showToast("Validation Error", "Percentage discount cannot exceed 100%.", "error")
      return
    }

    if (!formData.validFrom || !formData.validTo) {
      showToast("Validation Error", "Both valid from and valid to dates are required.", "error")
      return
    }

    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      showToast("Validation Error", "Valid from date must be before valid to date.", "error")
      return
    }

    if (new Date(formData.validTo) < new Date()) {
      showToast("Validation Error", "Valid to date cannot be in the past.", "error")
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingOffer
        ? `${API_BASE_URL}/api/admin/offers/${editingOffer._id}`
        : `${API_BASE_URL}/api/admin/offers`

      const method = editingOffer ? "PUT" : "POST"

      const requestBody = {
        title: formData.name.trim(),
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
        startDate: formData.validFrom,
        endDate: formData.validTo,
        usageLimit: Number(formData.usageLimit) || 0,
      }

      console.log(`📝 Submitting offer data:`, requestBody)

      const { response, data } = await makeApiRequest(url, {
        method,
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        console.log(`✅ Offer ${editingOffer ? "updated" : "created"} successfully:`, data)
        showToast(
          editingOffer ? "Offer Updated" : "Offer Created",
          `Offer "${data.title || formData.name}" has been ${editingOffer ? "updated" : "created"} successfully.`,
          "success",
        )
        setDialogOpen(false)
        resetForm()
        fetchOffers()
      }
    } catch (error) {
      console.error("❌ Submit error:", error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      showToast("Error", errorMessage, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer)
    setFormData({
      name: offer.title || offer.name || "",
      type: offer.type || "percentage",
      value: safeToString(offer.value),
      minOrderAmount: safeToString(getMinOrderAmount(offer), "0"),
      maxDiscount: safeToString(offer.maxDiscount, "0"),
      validFrom: (offer.startDate || offer.validFrom || "").split("T")[0],
      validTo: (offer.endDate || offer.validTo || "").split("T")[0],
      usageLimit: safeToString(offer.usageLimit, "0"),
    })
    setDialogOpen(true)
  }

  const handleDelete = async (offerId: string) => {
    if (!confirm("Are you sure you want to delete this offer? This action cannot be undone.")) return

    try {
      const { response } = await makeApiRequest(`${API_BASE_URL}/api/admin/offers/${offerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showToast("Offer Deleted", "Offer has been deleted successfully.", "success")
        fetchOffers()
      }
    } catch (error) {
      console.error("❌ Delete error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete offer"
      showToast("Error", errorMessage, "error")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "percentage",
      value: "",
      minOrderAmount: "",
      maxDiscount: "",
      validFrom: "",
      validTo: "",
      usageLimit: "",
    })
    setEditingOffer(null)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN")
  }

  const isOfferActive = (offer: Offer) => {
    const now = new Date()
    const validFrom = new Date(offer.startDate || offer.validFrom || "")
    const validTo = new Date(offer.endDate || offer.validTo || "")
    return offer.isActive && now >= validFrom && now <= validTo
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const handleRetry = () => {
    fetchOffers()
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-800"></div>
            <p className="text-gray-500 text-sm">Loading offers...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-6 p-6">
        {/* API Error Alerts */}
        {apiErrors.offers && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed to load offers</p>
                    <p className="text-xs text-red-600">{apiErrors.offers}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
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
            <h1 className="text-2xl font-semibold text-slate-900">Offers</h1>
            <p className="text-gray-600 text-sm">Create and manage promotional offers</p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-slate-800 hover:bg-slate-900 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-gray-200 pb-4">
                  <DialogTitle className="flex items-center space-x-2 text-slate-900">
                    <Gift className="h-5 w-5 text-slate-600" />
                    <span>{editingOffer ? "Edit Offer" : "Add New Offer"}</span>
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    {editingOffer
                      ? "Update offer information and details"
                      : "Create a new promotional offer for your store"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Offer Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter offer name"
                        required
                        className="border-gray-300"
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500">{formData.name.length}/100 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Discount Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="value">Discount Value * {formData.type === "percentage" ? "(%)" : "(₹)"}</Label>
                      <Input
                        id="value"
                        type="number"
                        step={formData.type === "percentage" ? "0.01" : "1"}
                        min="0"
                        max={formData.type === "percentage" ? "100" : undefined}
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="0"
                        required
                        className="border-gray-300"
                      />
                      {formData.type === "percentage" && <p className="text-xs text-gray-500">Maximum 100%</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                      <Input
                        id="minOrderAmount"
                        type="number"
                        min="0"
                        value={formData.minOrderAmount}
                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                        placeholder="0"
                        className="border-gray-300"
                      />
                      <p className="text-xs text-gray-500">Leave 0 for no minimum</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        min="0"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        placeholder="0"
                        className="border-gray-300"
                      />
                      <p className="text-xs text-gray-500">Leave 0 for no maximum</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="usageLimit">Usage Limit</Label>
                      <Input
                        id="usageLimit"
                        type="number"
                        min="0"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        placeholder="0"
                        className="border-gray-300"
                      />
                      <p className="text-xs text-gray-500">Leave 0 for unlimited usage</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Valid From *</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        required
                        className="border-gray-300"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="validTo">Valid To *</Label>
                      <Input
                        id="validTo"
                        type="date"
                        value={formData.validTo}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                        required
                        className="border-gray-300"
                        min={formData.validFrom || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  {/* Preview Section */}
                  {formData.name && formData.value && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Offer Preview</h4>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">{formData.name}</p>
                        <p>
                          {formData.value}
                          {formData.type === "percentage" ? "%" : "₹"} off
                          {formData.minOrderAmount &&
                            Number(formData.minOrderAmount) > 0 &&
                            ` on orders above ${formatCurrency(Number(formData.minOrderAmount))}`}
                          {formData.maxDiscount &&
                            Number(formData.maxDiscount) > 0 &&
                            ` (max ${formatCurrency(Number(formData.maxDiscount))})`}
                        </p>
                        {formData.validFrom && formData.validTo && (
                          <p className="text-xs text-gray-500 mt-1">
                            Valid from {formatDate(formData.validFrom)} to {formatDate(formData.validTo)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-slate-800 hover:bg-slate-900 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting
                        ? editingOffer
                          ? "Updating..."
                          : "Creating..."
                        : editingOffer
                          ? "Update Offer"
                          : "Create Offer"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Offers Table */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Gift className="h-5 w-5 text-slate-800" />
              All Offers ({offers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {offers.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="animate-bounce">
                    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Gift className="h-10 w-10 text-slate-400" />
                    </div>
                  </div>
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
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No offers yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Create your first promotional offer to boost sales and attract more customers.
                </p>
                <Button
                  onClick={() => {
                    resetForm()
                    setDialogOpen(true)
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white mb-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Offer
                </Button>
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
                      <TableHead className="font-medium text-slate-700">Offer Name</TableHead>
                      <TableHead className="font-medium text-slate-700">Discount</TableHead>
                      <TableHead className="font-medium text-slate-700">Min Order</TableHead>
                      <TableHead className="font-medium text-slate-700">Validity</TableHead>
                      <TableHead className="font-medium text-slate-700">Usage</TableHead>
                      <TableHead className="font-medium text-slate-700">Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="font-medium text-slate-800">
                          {offer.title || offer.name || "Untitled Offer"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                              {safeNumericValue(offer.value)}
                              {offer.type === "percentage" ? "%" : "₹"} off
                            </span>
                            {safeNumericValue(offer.maxDiscount) > 0 && (
                              <span className="text-xs text-gray-500">
                                Max: {formatCurrency(safeNumericValue(offer.maxDiscount))}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-800">
                            {getMinOrderAmount(offer) > 0 ? formatCurrency(getMinOrderAmount(offer)) : "No minimum"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-slate-800">
                              {formatDate(offer.startDate || offer.validFrom || "")}
                            </div>
                            <div className="text-gray-500">to {formatDate(offer.endDate || offer.validTo || "")}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-slate-800">
                              {safeNumericValue(offer.usedCount)} / {safeNumericValue(offer.usageLimit) || "∞"}
                            </div>
                            {safeNumericValue(offer.usageLimit) > 0 && (
                              <div className="text-gray-500">
                                {Math.round(
                                  (safeNumericValue(offer.usedCount) / safeNumericValue(offer.usageLimit)) * 100,
                                )}
                                % used
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isOfferActive(offer) ? "default" : "secondary"}
                            className={`text-xs ${
                              isOfferActive(offer)
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {isOfferActive(offer) ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(offer)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Offer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(offer._id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
