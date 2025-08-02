"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import type React from "react"
import { useState, useEffect, useCallback } from "react" // Added useCallback
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import ImageUpload from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  Search,
  Filter,
  Tag,
  Save,
  X,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Copy,
  Download,
  Upload,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"

// Interfaces
interface Product {
  _id: string
  name: string
  sku: string
  slug: string
  thumbnail: string
  gallery: string[]
  price: number
  originalPrice?: number
  stock?: number
  stockStatus: string
  shortDescription: string
  description: string
  category: { _id: string; name: string }
  offer?: { _id: string; name: string; type: string; value: number }
  tags: string[]
  weight: number
  dimensions: { length: number; width: number; height: number }
  taxPercentage: number
  lowStockAlert: number
  allowBackorders: boolean
  metaTitle: string
  metaDescription: string
  isActive: boolean
  createdAt: string
  discountPercentage?: number
  hasVariants: boolean
  variants: ProductVariant[]
  trackQuantity: boolean
  variantAttributes: { name: string; values: string[] }[]
}

interface Category {
  _id: string
  name: string
}

interface Offer {
  _id: string
  name: string
  type: string
  value: number
}

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

interface ProductVariant {
  _id?: string
  name: string
  options: { attributeName: string; value: string }[] // Changed to non-optional
  price: string
  originalPrice?: string
  stock?: string
  sku: string
  isActive: boolean
  image: string
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.yespstudio.com"

// Utility functions for safe string conversion
const safeToString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number") return value.toString()
  if (typeof value === "boolean") return value.toString()
  return String(value)
}

const safeToNumber = (value: any): number => {
  if (value === null || value === undefined || value === "") return 0
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

// Toast Notification Component
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [apiErrors, setApiErrors] = useState<{ [key: string]: string }>({})

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    shortDescription: "",
    description: "",
    price: "",
    originalPrice: "", // This will be MRP
    taxPercentage: "",
    stock: "",
    lowStockAlert: "5",
    allowBackorders: false,
    category: "",
    offer: "none",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    metaTitle: "",
    metaDescription: "",
    hasVariants: false,
    variants: [] as ProductVariant[],
    trackQuantity: true,
    variantAttributes: [] as { name: string; values: string[] }[],
  })
  const [images, setImages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()

  // Variant Dialog State
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [variantImageUploadKey, setVariantImageUploadKey] = useState(0)

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

  // Enhanced API error handling with better logging
  const handleApiError = (endpoint: string, response: Response, data?: any): string => {
    console.error(`❌ API Error for ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      // Stringify data for better console readability if it's an object
      data: typeof data === "object" && data !== null ? JSON.stringify(data, null, 2) : data,
      headers: Object.fromEntries(response.headers.entries()),
    })
    let errorMessage = "Something went wrong. Please try again."
    if (data?.error) {
      errorMessage = data.error
    } else if (data?.message) {
      errorMessage = data.message
    } else if (data?.details) {
      if (Array.isArray(data.details)) {
        errorMessage = data.details.map((detail: any) => detail.message || detail).join(", ")
      } else if (typeof data.details === "string") {
        errorMessage = data.details
      } else if (typeof data.details === "object") {
        const validationErrors = Object.entries(data.details)
          .map(([field, error]) => `${field}: ${error}`)
          .join(", ")
        errorMessage = validationErrors || "Validation failed"
      }
    } else if (data?.errors) {
      if (Array.isArray(data.errors)) {
        errorMessage = data.errors.map((error: any) => error.message || error).join(", ")
      } else if (typeof data.errors === "object") {
        const validationErrors = Object.entries(data.errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join(", ")
        errorMessage = validationErrors || "Validation failed"
      }
    } else {
      switch (response.status) {
        case 400:
          errorMessage = "Bad request. Please check your data and try again."
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
          errorMessage = "Conflict. Resource already exists or there's a duplicate."
          break
        case 422:
          errorMessage = "Validation failed. Please check your input."
          break
        case 429:
          errorMessage = "Too many requests. Please wait a moment and try again."
          break
        case 500:
          errorMessage = "Server error. Please try again later."
          break
        default:
          errorMessage = `Request failed with status ${response.status}. Please try again.`
      }
    }
    return errorMessage
  }

  // Enhanced API request function
  const makeApiRequest = async (
    url: string,
    options: RequestInit = {},
    retries = 2,
  ): Promise<{ response: Response; data: any }> => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found. Please log in.")
    }

    const defaultHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    }

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json"
    }

    const defaultOptions: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    }

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
            data = {} // If response is OK but JSON is invalid, treat as empty object
          } else {
            throw new Error(`Invalid JSON response: ${responseText}`)
          }
        }

        if (!response.ok) {
          const errorMessage = handleApiError(url, response, data)
          if (attempt === retries) {
            throw new Error(errorMessage)
          }
          showToast("API Error", `Retrying... (${attempt + 1}/${retries})`, "warning")
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }
        return { response, data }
      } catch (error) {
        console.error(`❌ Request failed (attempt ${attempt + 1}):`, error)
        if (attempt === retries) {
          throw error
        }
        showToast("Network Error", `Retrying... (${attempt + 1}/${retries})`, "warning")
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
    throw new Error("Max retries exceeded")
  }

  // Auto-generate SKU function
  const generateSKU = () => {
    const prefix =
      formData.name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 3) || "PRD"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 3).toUpperCase()
    const newSKU = `${prefix}${timestamp}${random}`
    setFormData((prev) => ({ ...prev, sku: newSKU }))
    showToast("SKU Generated", `New SKU: ${newSKU}`, "success")
  }

  // Auto-generate variant SKU
  const generateVariantSKU = () => {
    if (!editingVariant) return

    const baseSKU = formData.sku || "PRD"
    // Generate variant SKU from options if available, otherwise from name
    const variantOptionString =
      editingVariant.options?.map((opt) => opt.value).join("-") || editingVariant.name || "VAR"
    const variantNamePart = variantOptionString
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6)
    const timestamp = Date.now().toString().slice(-4)
    const newSKU = `${baseSKU}-${variantNamePart}${timestamp}`

    setEditingVariant((prev) => {
      if (!prev) return null
      return { ...prev, sku: newSKU }
    })
    showToast("Variant SKU Generated", `New SKU: ${newSKU}`, "success")
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchOffers()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory, selectedStatus])

  const fetchProducts = async () => {
    try {
      setApiErrors((prev) => ({ ...prev, products: "" }))
      const { data } = await makeApiRequest(`${API_BASE_URL}/api/admin/products`)
      setProducts(Array.isArray(data) ? data : [])
      showToast("Products Loaded", `Successfully loaded ${Array.isArray(data) ? data.length : 0} products.`, "success")
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch products"
      setApiErrors((prev) => ({ ...prev, products: errorMessage }))
      showToast("Error Loading Products", errorMessage, "error")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setApiErrors((prev) => ({ ...prev, categories: "" }))
      const { data } = await makeApiRequest(`${API_BASE_URL}/api/admin/categories`)
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("❌ Error fetching categories:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch categories"
      setApiErrors((prev) => ({ ...prev, categories: errorMessage }))
      showToast("Error Loading Categories", errorMessage, "warning")
      setCategories([])
    }
  }

  const fetchOffers = async () => {
    try {
      setApiErrors((prev) => ({ ...prev, offers: "" }))
      const { data } = await makeApiRequest(`${API_BASE_URL}/api/admin/offers`)
      setOffers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("❌ Error fetching offers:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch offers"
      setApiErrors((prev) => ({ ...prev, offers: errorMessage }))
      showToast("Error Loading Offers", errorMessage, "warning")
      setOffers([])
    }
  }

  const filterProducts = () => {
    let filtered = products
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category._id === selectedCategory)
    }
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        filtered = filtered.filter((product) => product.isActive)
      } else if (selectedStatus === "inactive") {
        filtered = filtered.filter((product) => !product.isActive)
      } else if (selectedStatus === "low-stock") {
        filtered = filtered.filter(
          (product) => product.trackQuantity && product.stock !== undefined && product.stock <= product.lowStockAlert,
        )
      } else if (selectedStatus === "out-of-stock") {
        filtered = filtered.filter(
          (product) =>
            product.trackQuantity && product.stock !== undefined && product.stock === 0 && !product.allowBackorders,
        )
      }
    }
    setFilteredProducts(filtered)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith("dimensions.")) {
      const dimensionKey = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionKey]: value,
        },
      }))
    } else {
      setFormData((prev) => {
        const newFormData = { ...prev, [name]: value }
        // Apply pricing validation immediately and synchronously
        if (name === "price" || name === "originalPrice") {
          if (!newFormData.hasVariants) {
            const priceValue = safeToNumber(newFormData.price)
            const originalPriceValue = safeToNumber(newFormData.originalPrice)
            if (newFormData.originalPrice && originalPriceValue <= priceValue) {
              newFormData.originalPrice = "" // Clear MRP
              showToast("Price Adjusted", "MRP was cleared because it must be greater than selling price", "warning")
            }
          }
        }
        return newFormData
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: checked }
      if (name === "hasVariants" && !checked) {
        newFormData.variants = []
        newFormData.variantAttributes = [] // Clear variant attributes if variants are disabled
        // If switching from variant to non-variant, reset main product price/stock
        newFormData.price = ""
        newFormData.originalPrice = ""
        newFormData.stock = ""
      } else if (name === "hasVariants" && checked) {
        // If switching to variant, clear main product price/stock
        newFormData.price = ""
        newFormData.originalPrice = ""
        newFormData.stock = ""
      }
      return newFormData
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags((prev) => [...prev, tagInput.trim().toLowerCase()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  // Variant Management Functions
  // This function is now primarily for editing an existing variant's details
  const handleEditVariantClick = (variant: ProductVariant) => {
    const safeVariant: ProductVariant = {
      _id: variant._id,
      name: safeToString(variant.name),
      options:
        variant.options?.map((opt) => ({
          attributeName: safeToString(opt.attributeName),
          value: safeToString(opt.value),
        })) || [],
      price: safeToString(variant.price),
      originalPrice: variant.originalPrice ? safeToString(variant.originalPrice) : "",
      sku: safeToString(variant.sku),
      isActive: Boolean(variant.isActive),
      image: safeToString(variant.image),
    }
    if (formData.trackQuantity && variant.stock !== undefined) {
      safeVariant.stock = safeToString(variant.stock)
    }
    setEditingVariant(safeVariant)
    setVariantImageUploadKey((prev) => prev + 1) // Force re-render ImageUpload
    setIsVariantDialogOpen(true)
  }

  const handleDeleteVariant = (variantToDelete: ProductVariant) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v._id !== variantToDelete._id && v.sku !== variantToDelete.sku),
    }))
    showToast("Variant Deleted", `Variant '${variantToDelete.name}' has been removed.`, "success")
  }

  const handleVariantFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setEditingVariant((prev) => {
      if (!prev) return null
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }
      if (name === "price" || name === "originalPrice") {
        const priceValue = safeToNumber(updated.price)
        const originalPriceValue = safeToNumber(updated.originalPrice || "")
        if (updated.originalPrice && originalPriceValue <= priceValue) {
          updated.originalPrice = ""
          showToast("Price Adjusted", "MRP was cleared because it must be greater than selling price", "warning")
        }
      }
      return updated
    })
  }

  const handleVariantImageChange = (images: string[]) => {
    setEditingVariant((prev) => {
      if (!prev) return null
      return {
        ...prev,
        image: images.length > 0 ? images[0] : "",
      }
    })
  }

  const handleSaveVariant = () => {
    if (!editingVariant) return

    const requiredFields = ["price", "sku"]
    if (formData.trackQuantity) {
      requiredFields.push("stock")
    }

    const missingFields = requiredFields.filter((field) => {
      const value = editingVariant[field as keyof ProductVariant]
      const stringValue = safeToString(value)
      if (field === "stock" && formData.trackQuantity) {
        const stockNum = safeToNumber(stringValue)
        return stringValue.trim() === "" || isNaN(stockNum) || stockNum < 0
      }
      return !stringValue || stringValue.trim() === ""
    })

    if (missingFields.length > 0) {
      showToast("Validation Error", `Variant fields missing: ${missingFields.join(", ")}. Please fill them.`, "error")
      return
    }

    const editingVariantSku = safeToString(editingVariant.sku).trim().toUpperCase()
    const isDuplicateSKU = formData.variants.some((v) => {
      const variantSku = safeToString(v.sku).trim().toUpperCase()
      return variantSku === editingVariantSku && v._id !== editingVariant._id
    })

    if (isDuplicateSKU) {
      showToast("Duplicate SKU", "This SKU is already used by another variant.", "error")
      return
    }

    const variantToSave: ProductVariant = {
      _id:
        editingVariant._id && !editingVariant._id.startsWith("temp-")
          ? editingVariant._id
          : `temp-${Date.now()}-${Math.random()}`, // Assign temp ID if new
      name: safeToString(editingVariant.name).trim(),
      options:
        editingVariant.options?.map((opt) => ({
          attributeName: safeToString(opt.attributeName).trim(),
          value: safeToString(opt.value).trim(),
        })) || [],
      price: safeToString(editingVariant.price),
      originalPrice: editingVariant.originalPrice ? safeToString(editingVariant.originalPrice) : undefined,
      sku: safeToString(editingVariant.sku).trim().toUpperCase(),
      isActive: Boolean(editingVariant.isActive),
      image: safeToString(editingVariant.image),
    }

    if (formData.trackQuantity && editingVariant.stock !== undefined) {
      variantToSave.stock = safeToString(editingVariant.stock)
    }

    setFormData((prev) => {
      const existingIndex = prev.variants.findIndex((v) => v._id === editingVariant._id)
      if (existingIndex !== -1) {
        const updatedVariants = [...prev.variants]
        updatedVariants[existingIndex] = variantToSave
        return { ...prev, variants: updatedVariants }
      } else {
        // This case should ideally not happen if variants are generated, but kept for robustness
        return { ...prev, variants: [...prev.variants, variantToSave] }
      }
    })

    showToast("Variant Saved", `Variant '${safeToString(editingVariant.name)}' has been saved.`, "success")
    setIsVariantDialogOpen(false)
    setEditingVariant(null)
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push("Product name is required")
    }
    if (!formData.sku.trim()) {
      errors.push("SKU is required")
    }
    if (!formData.shortDescription.trim()) {
      errors.push("Short description is required")
    }
    if (!formData.description.trim()) {
      errors.push("Description is required")
    }
    if (!formData.category) {
      errors.push("Category is required")
    }

    if (!formData.hasVariants) {
      const priceValue = safeToNumber(formData.price)
      if (!formData.price || priceValue <= 0) {
        errors.push("Selling Price must be greater than 0")
      }
      if (formData.originalPrice && formData.originalPrice.trim() !== "") {
        const originalPriceValue = safeToNumber(formData.originalPrice)
        if (isNaN(originalPriceValue) || originalPriceValue <= 0) {
          errors.push("MRP must be a valid positive number")
        } else if (originalPriceValue <= priceValue) {
          errors.push("MRP must be greater than Selling Price")
        }
      }
      if (formData.trackQuantity) {
        const stockValue = safeToNumber(formData.stock)
        if (formData.stock.trim() === "" || isNaN(stockValue) || stockValue < 0) {
          errors.push("Stock quantity cannot be empty, negative, or invalid when quantity tracking is enabled")
        }
      }
      if (!editingProduct && images.length === 0) {
        errors.push("At least one product image is required")
      }
    } else {
      // Validate variant attributes
      if (formData.variantAttributes.length === 0) {
        errors.push("At least one variant attribute (e.g., Size, Color) is required when variants are enabled.")
      } else {
        const missingAttributeFields = formData.variantAttributes.some(
          (attr) => !attr.name.trim() || attr.values.length === 0 || attr.values.some((val) => !val.trim()),
        )
        if (missingAttributeFields) {
          errors.push("All variant attributes must have a name and at least one value.")
        }
        const duplicateAttributeNames =
          new Set(formData.variantAttributes.map((attr) => attr.name.toLowerCase())).size !==
          formData.variantAttributes.length
        if (duplicateAttributeNames) {
          errors.push("Variant attribute names must be unique.")
        }
      }

      if (formData.variants.length === 0) {
        errors.push("At least one variant is required when variants are enabled")
      }

      for (let i = 0; i < formData.variants.length; i++) {
        const variant = formData.variants[i]
        const variantName = safeToString(variant.name)

        if (!variantName || variantName.trim() === "") {
          errors.push(`Variant ${i + 1}: Name is required`)
        }

        const variantPrice = safeToString(variant.price)
        const priceValue = safeToNumber(variantPrice)
        if (!variantPrice || variantPrice.trim() === "" || isNaN(priceValue) || priceValue <= 0) {
          errors.push(`Variant "${variantName}": Valid Selling Price is required`)
        }

        if (formData.trackQuantity) {
          const variantStock = safeToString(variant.stock || "")
          const stockValue = safeToNumber(variantStock)
          if (variantStock.trim() === "" || isNaN(stockValue) || stockValue < 0) {
            errors.push(`Variant "${variantName}": Valid stock quantity is required when quantity tracking is enabled`)
          }
        }

        const variantSku = safeToString(variant.sku)
        if (!variantSku || variantSku.trim() === "") {
          errors.push(`Variant "${variantName}": SKU is required`)
        }

        const currentSku = variantSku.trim().toUpperCase()
        const duplicateSku = formData.variants.find((v, index) => {
          if (index === i) return false
          const otherSku = safeToString(v.sku).trim().toUpperCase()
          return otherSku === currentSku
        })
        if (duplicateSku) {
          errors.push(`Duplicate SKU "${variantSku}" found in variants`)
        }

        const variantOriginalPrice = safeToString(variant.originalPrice || "")
        if (variantOriginalPrice && variantOriginalPrice.trim() !== "") {
          const originalPriceValue = safeToNumber(variantOriginalPrice)
          if (isNaN(originalPriceValue) || originalPriceValue <= 0) {
            errors.push(`Variant "${variantName}": MRP must be a valid positive number`)
          } else if (originalPriceValue <= priceValue) {
            errors.push(`Variant "${variantName}": MRP must be greater than Selling Price`)
          }
        }

        // Validate variant options structure against defined attributes
        const definedAttributes = formData.variantAttributes.map((attr) => attr.name.toLowerCase())
        const variantOptionNames = variant.options.map((opt) => opt.attributeName.toLowerCase())

        if (
          variant.options.length !== definedAttributes.length ||
          !definedAttributes.every((attrName) => variantOptionNames.includes(attrName))
        ) {
          errors.push(`Variant "${variantName}": Options do not match defined variant attributes.`)
        } else {
          const invalidOptionValues = variant.options.some((opt) => {
            const attributeDef = formData.variantAttributes.find(
              (attr) => attr.name.toLowerCase() === opt.attributeName.toLowerCase(),
            )
            return !attributeDef || !attributeDef.values.includes(opt.value)
          })
          if (invalidOptionValues) {
            errors.push(`Variant "${variantName}": One or more option values are invalid for their attribute.`)
          }
        }
      }

      const hasMainImages = images.length > 0
      const hasVariantImages = formData.variants.some((variant) => {
        const variantImage = safeToString(variant.image)
        return variantImage && variantImage.trim() !== ""
      })
      if (!editingProduct && !hasMainImages && !hasVariantImages) {
        errors.push("At least one image is required (either main product images or variant images)")
      }
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      showToast("Validation Error", validationErrors[0], "error")
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = new FormData()

      // Append all form data fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "dimensions") {
          submitData.append(key, JSON.stringify(value))
        } else if (key === "variants") {
          if (formData.hasVariants) {
            const cleanedVariants = formData.variants
              .filter((variant) => {
                // Ensure required fields for variants are present
                const requiredFields = ["name", "price", "sku"]
                if (formData.trackQuantity) {
                  requiredFields.push("stock")
                }
                const isValid = requiredFields.every((field) => {
                  const fieldValue = safeToString(variant[field as keyof ProductVariant])
                  if (field === "stock" && formData.trackQuantity) {
                    const stockNum = safeToNumber(fieldValue)
                    return fieldValue.trim() !== "" && !isNaN(stockNum) && stockNum >= 0
                  }
                  return fieldValue && fieldValue.trim() !== ""
                })

                // Also validate options for variants
                const hasValidOptions =
                  variant.options &&
                  variant.options.length > 0 &&
                  !variant.options.some((opt) => !opt.attributeName.trim() || !opt.value.trim())
                return isValid && hasValidOptions
              })
              .map((variant) => {
                // Convert numeric fields to actual numbers
                const cleanVariant: any = {
                  name: safeToString(variant.name).trim(),
                  options:
                    variant.options?.map((opt) => ({
                      attributeName: safeToString(opt.attributeName).trim(),
                      value: safeToString(opt.value).trim(),
                    })) || [],
                  price: Number.parseFloat(safeToString(variant.price)) || 0,
                  sku: safeToString(variant.sku).trim().toUpperCase(),
                  isActive: Boolean(variant.isActive),
                  image: safeToString(variant.image),
                }

                if (formData.trackQuantity && variant.stock !== undefined) {
                  // Ensure stock is sent as a string to match Mongoose schema's type: String
                  cleanVariant.stock = safeToString(variant.stock)
                } else if (!formData.trackQuantity) {
                  // If quantity is not tracked, ensure stock is not sent for variants
                  delete cleanVariant.stock
                }

                if (variant._id && !variant._id.startsWith("temp-") && variant._id.match(/^[0-9a-fA-F]{24}$/)) {
                  cleanVariant._id = variant._id
                }

                const originalPrice = safeToString(variant.originalPrice || "")
                if (originalPrice.trim() === "") {
                  cleanVariant.originalPrice = undefined // Send undefined to omit from payload if empty
                } else {
                  // Ensure originalPrice is sent as a string to match Mongoose schema's type: String
                  cleanVariant.originalPrice = originalPrice
                }
                return cleanVariant
              })
            submitData.append(key, JSON.stringify(cleanedVariants))
          } else {
            submitData.append(key, JSON.stringify([]))
          }
        } else if (key === "variantAttributes") {
          // Handle variantAttributes
          if (formData.hasVariants) {
            const cleanedAttributes = formData.variantAttributes.filter(
              (attr) => attr.name.trim() && attr.values.length > 0 && !attr.values.some((val) => !val.trim()),
            )
            submitData.append(key, JSON.stringify(cleanedAttributes))
          } else {
            submitData.append(key, JSON.stringify([]))
          }
        } else if (key === "hasVariants" || key === "allowBackorders" || key === "trackQuantity") {
          // Explicitly handle boolean fields
          submitData.append(key, value.toString())
        } else if (value !== null && value !== undefined) {
          const stringValue = safeToString(value)
          if (key === "price") {
            // Always append price. Backend will handle validation and parsing.
            submitData.append(key, stringValue)
          } else if (key === "originalPrice") {
            // Always append originalPrice. Backend will handle validation and parsing.
            submitData.append(key, stringValue)
          } else if (key === "stock") {
            // For main product stock (non-variant, quantity tracked)
            if (formData.trackQuantity && !formData.hasVariants) {
              const stockNum = safeToNumber(value)
              submitData.append(key, stockNum.toString()) // Ensure it's a string
            }
            // If not tracking quantity or has variants, stock is not appended for main product.
          } else if (["taxPercentage", "weight", "lowStockAlert"].includes(key)) {
            const numValue = Number.parseFloat(stringValue)
            if (stringValue.trim() === "") {
              submitData.append(key, "null")
            } else if (!isNaN(numValue)) {
              submitData.append(key, numValue.toString())
            }
          } else {
            submitData.append(key, stringValue)
          }
        }
      })

      submitData.append("tags", JSON.stringify(tags))
      submitData.append("existingImages", JSON.stringify(images)) // Send main product images as a JSON array

      if (formData.offer && formData.offer !== "none") {
        submitData.append("offer", formData.offer)
      }

      const url = editingProduct
        ? `${API_BASE_URL}/api/admin/products/${editingProduct._id}`
        : `${API_BASE_URL}/api/admin/products`
      const method = editingProduct ? "PUT" : "POST"

      const { response, data } = await makeApiRequest(url, {
        method,
        body: submitData,
        headers: {
          // Content-Type is automatically set to multipart/form-data when using FormData
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        showToast(
          editingProduct ? "Product Updated" : "Product Created",
          `Product "${data.data?.name || formData.name}" has been ${editingProduct ? "updated" : "created"} successfully.`,
          "success",
        )
        setDialogOpen(false)
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      console.error("❌ Submit error:", error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      if (errorMessage.includes("Validation failed")) {
        showToast(
          "Validation Error",
          "Please check all required fields and ensure data is valid. Check the console for detailed error information.",
          "error",
        )
      } else {
        showToast("Error", errorMessage, "error")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleView = (product: Product) => {
    setViewingProduct(product)
    setViewDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: safeToString(product.name),
      sku: safeToString(product.sku),
      shortDescription: safeToString(product.shortDescription),
      description: safeToString(product.description),
      // Clear price/stock if it's a variant product, as they are managed by variants
      price: product.hasVariants ? "" : safeToString(product.price),
      // FIX: If originalPrice is 0, treat it as empty string to avoid validation issues
      originalPrice:
        !product.hasVariants && product.originalPrice === 0 ? "" : safeToString(product.originalPrice || ""),
      taxPercentage: safeToString(product.taxPercentage || 0),
      stock: product.hasVariants ? "" : safeToString(product.stock || ""), // Clear if variants
      lowStockAlert: safeToString(product.lowStockAlert || 5),
      allowBackorders: Boolean(product.allowBackorders),
      category: safeToString(product.category?._id || ""),
      offer: safeToString(product.offer?._id || "none"),
      weight: safeToString(product.weight || 0),
      dimensions: {
        length: safeToString(product.dimensions?.length || 0),
        width: safeToString(product.dimensions?.width || 0),
        height: safeToString(product.dimensions?.height || 0),
      },
      metaTitle: safeToString(product.metaTitle || ""),
      metaDescription: safeToString(product.metaDescription || ""),
      hasVariants: Boolean(product.hasVariants),
      variants: product.variants
        ? product.variants.map((variant) => ({
            _id: variant._id,
            name: safeToString(variant.name),
            options:
              variant.options?.map((opt) => ({
                attributeName: safeToString(opt.attributeName),
                value: safeToString(opt.value),
              })) || [],
            price: safeToString(variant.price),
            originalPrice: variant.originalPrice ? safeToString(variant.originalPrice) : undefined,
            stock: variant.stock !== undefined ? safeToString(variant.stock) : undefined,
            sku: safeToString(variant.sku),
            isActive: Boolean(variant.isActive),
            image: safeToString(variant.image || ""),
          }))
        : [],
      trackQuantity: product.trackQuantity !== undefined ? Boolean(product.trackQuantity) : true,
      variantAttributes:
        product.variantAttributes?.map((attr) => ({
          name: safeToString(attr.name),
          values: attr.values?.map((val) => safeToString(val)) || [],
        })) || [],
    })
    setImages(product.gallery ? [...product.gallery] : [])
    setTags(product.tags ? [...product.tags] : [])
    setTagInput("")
    setDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return
    try {
      const { response } = await makeApiRequest(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        showToast("Product Deleted", "Product has been deleted successfully.", "success")
        fetchProducts()
      }
    } catch (error) {
      console.error("❌ Delete error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete product"
      showToast("Error", errorMessage, "error")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      shortDescription: "",
      description: "",
      price: "",
      originalPrice: "",
      taxPercentage: "",
      stock: "",
      lowStockAlert: "5",
      allowBackorders: false,
      category: "",
      offer: "none",
      weight: "",
      dimensions: {
        length: "",
        width: "",
        height: "",
      },
      metaTitle: "",
      metaDescription: "",
      hasVariants: false,
      variants: [],
      trackQuantity: true,
      variantAttributes: [], // Reset variant attributes
    })
    setImages([])
    setTags([])
    setTagInput("")
    setEditingProduct(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const getStockStatusColor = (product: Product) => {
    if (!product.trackQuantity) {
      return "bg-blue-50 text-blue-700 border border-blue-200"
    }
    const stock = product.stock || 0
    const lowStockAlert = product.lowStockAlert || 5
    const allowBackorders = product.allowBackorders || false

    if (product.hasVariants) {
      const totalVariantStock = product.variants.reduce((sum, v) => sum + safeToNumber(v.stock), 0)
      if (totalVariantStock === 0 && !allowBackorders) {
        return "bg-red-50 text-red-700 border border-red-200"
      } else if (totalVariantStock <= lowStockAlert && totalVariantStock > 0) {
        return "bg-amber-50 text-amber-700 border border-amber-200"
      } else if (totalVariantStock > 0) {
        return "bg-green-50 text-green-700 border border-green-200"
      } else if (totalVariantStock === 0 && allowBackorders) {
        return "bg-orange-50 text-orange-700 border border-orange-200"
      }
    } else {
      if (stock === 0 && !allowBackorders) {
        return "bg-red-50 text-red-700 border border-red-200"
      } else if (stock <= lowStockAlert && stock > 0) {
        return "bg-amber-50 text-amber-700 border border-amber-200"
      } else if (stock > 0) {
        return "bg-green-50 text-green-700 border border-green-200"
      } else if (stock === 0 && allowBackorders) {
        return "bg-orange-50 text-orange-700 border border-orange-200"
      }
    }
    return "bg-gray-50 text-gray-700 border border-gray-200"
  }

  const getStockStatusText = (product: Product) => {
    if (!product.trackQuantity) {
      return "Not Tracked"
    }
    const lowStockAlert = product.lowStockAlert || 5
    const allowBackorders = product.allowBackorders || false

    let currentStock = 0
    if (product.hasVariants) {
      currentStock = product.variants.reduce((sum, v) => sum + safeToNumber(v.stock), 0)
    } else {
      currentStock = product.stock || 0
    }

    if (currentStock === 0 && !allowBackorders) {
      return "Out of Stock"
    } else if (currentStock <= lowStockAlert && currentStock > 0) {
      return "Low Stock"
    } else if (currentStock > 0) {
      return "In Stock"
    } else if (currentStock === 0 && allowBackorders) {
      return "Out of Stock (Backorderable)"
    }
    return "Unknown"
  }

  const handleRetry = (type: "products" | "categories" | "offers") => {
    switch (type) {
      case "products":
        fetchProducts()
        break
      case "categories":
        fetchCategories()
        break
      case "offers":
        fetchOffers()
        break
    }
  }

  const handleExportProducts = () => {
    showToast("Export Started", "Product export will be available soon.", "info")
  }

  const handleImportProducts = () => {
    showToast("Import Feature", "Product import will be available soon.", "info")
  }

  // Functions to manage variant attributes
  const handleAddVariantAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      variantAttributes: [...prev.variantAttributes, { name: "", values: [] }],
    }))
  }

  const handleRemoveVariantAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variantAttributes: prev.variantAttributes.filter((_, i) => i !== index),
    }))
  }

  const handleVariantAttributeNameChange = (index: number, name: string) => {
    setFormData((prev) => {
      const newAttributes = [...prev.variantAttributes]
      newAttributes[index] = { ...newAttributes[index], name }
      return { ...prev, variantAttributes: newAttributes }
    })
  }

  const handleVariantAttributeValuesChange = (index: number, valuesString: string) => {
    setFormData((prev) => {
      const newAttributes = [...prev.variantAttributes]
      newAttributes[index] = {
        ...newAttributes[index],
        values: valuesString
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }
      return { ...prev, variantAttributes: newAttributes }
    })
  }

  // Function to generate all possible variant combinations
  const generateVariantCombinations = useCallback(() => {
    if (!formData.hasVariants || formData.variantAttributes.length === 0) {
      showToast("Info", "No variant attributes defined to generate combinations.", "info")
      setFormData((prev) => ({ ...prev, variants: [] }))
      return
    }

    const validAttributes = formData.variantAttributes.filter(
      (attr) => attr.name.trim() && attr.values.length > 0 && !attr.values.some((val) => !val.trim()),
    )

    if (validAttributes.length === 0) {
      showToast("Validation Error", "Please define at least one valid variant attribute with values.", "error")
      setFormData((prev) => ({ ...prev, variants: [] }))
      return
    }

    const newVariants: ProductVariant[] = []

    // Recursive function to generate combinations
    const generate = (index: number, currentCombination: { attributeName: string; value: string }[]) => {
      if (index === validAttributes.length) {
        // Create a unique key for the combination to check for existing variants
        const combinationKey = currentCombination
          .map((opt) => `${opt.attributeName.toLowerCase()}:${opt.value.toLowerCase()}`)
          .sort()
          .join("|")

        const existingVariant = formData.variants.find((v) => {
          if (v.options.length !== currentCombination.length) return false
          const variantOptionsKey = v.options
            .map((opt) => `${opt.attributeName.toLowerCase()}:${opt.value.toLowerCase()}`)
            .sort()
            .join("|")
          return variantOptionsKey === combinationKey
        })

        const variantName = currentCombination.map((opt) => `${opt.attributeName}: ${opt.value}`).join(" / ")

        if (existingVariant) {
          // If variant exists, use its data (e.g., _id, price, stock, image)
          newVariants.push({ ...existingVariant, name: variantName })
        } else {
          // Create a new temporary variant
          newVariants.push({
            _id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID for new variants
            name: variantName,
            options: currentCombination,
            price: "", // Default empty
            originalPrice: "",
            stock: formData.trackQuantity ? "" : undefined, // Default empty if tracking
            sku: "", // Will be auto-generated on save or manually
            isActive: true,
            image: "",
          })
        }
        return
      }

      const currentAttribute = validAttributes[index]
      currentAttribute.values.forEach((value) => {
        generate(index + 1, [...currentCombination, { attributeName: currentAttribute.name, value: value }])
      })
    }

    generate(0, [])
    setFormData((prev) => ({ ...prev, variants: newVariants }))
    showToast("Variants Generated", `Generated ${newVariants.length} variant combinations.`, "success")
  }, [formData.variantAttributes, formData.variants, formData.trackQuantity]) // Added dependencies

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-800"></div>
            <p className="text-gray-500 text-sm">Loading products...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
            <p className="text-gray-600 text-sm">Manage your product inventory and catalog</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={handleExportProducts}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={handleImportProducts}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-slate-800 hover:bg-slate-900 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-full md:max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-gray-200 pb-4">
                  <DialogTitle className="flex items-center space-x-2 text-slate-900">
                    <Package className="h-5 w-5 text-slate-600" />
                    <span>{editingProduct ? "Edit Product" : "Add New Product"}</span>
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    {editingProduct ? "Update product information and details" : "Create a new product for your store"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-gray-100">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                      <TabsTrigger value="media">Images</TabsTrigger>
                      <TabsTrigger value="variants">Variants</TabsTrigger>
                      <TabsTrigger value="seo">SEO & More</TabsTrigger>
                    </TabsList>
                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter product name"
                            required
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU *</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="sku"
                              name="sku"
                              value={formData.sku}
                              onChange={handleInputChange}
                              placeholder="e.g., TSHIRT001"
                              required
                              className="border-gray-300"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generateSKU}
                              className="px-3 bg-transparent"
                              title="Auto-generate SKU"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shortDescription">Short Description *</Label>
                        <Textarea
                          id="shortDescription"
                          name="shortDescription"
                          value={formData.shortDescription}
                          onChange={handleInputChange}
                          placeholder="Brief product description (max 200 characters)"
                          maxLength={200}
                          rows={2}
                          required
                          className="border-gray-300"
                        />
                        <p className="text-xs text-gray-500">{formData.shortDescription.length}/200 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Full Description *</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Detailed product description"
                          rows={4}
                          required
                          className="border-gray-300"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => handleSelectChange("category", value)}
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category._id} value={category._id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Offer (Optional)</Label>
                          <Select value={formData.offer} onValueChange={(value) => handleSelectChange("offer", value)}>
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select offer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No offer</SelectItem>
                              {offers.map((offer) => (
                                <SelectItem key={offer._id} value={offer._id}>
                                  {offer.name} ({offer.value}
                                  {offer.type === "percentage" ? "%" : offer.type === "flat" ? " off" : ""})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Quantity Tracking Toggle */}
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckboxChange("trackQuantity", !formData.trackQuantity)}
                            className="p-0 h-auto"
                          >
                            {formData.trackQuantity ? (
                              <ToggleRight className="h-6 w-6 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-gray-400" />
                            )}
                          </Button>
                          <Label className="text-sm font-medium">Track Quantity</Label>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">
                            {formData.trackQuantity
                              ? "Stock quantities will be tracked and managed for this product."
                              : "This product will not track stock quantities (suitable for digital products or services)."}
                          </p>
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="space-y-2">
                        <Label>Product Tags</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add a tag"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                            className="border-gray-300"
                          />
                          <Button type="button" onClick={addTag} variant="outline">
                            <Tag className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                                onClick={() => removeTag(tag)}
                              >
                                {tag} <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    {/* Pricing Tab */}
                    <TabsContent value="pricing" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="originalPrice">MRP (₹)</Label>
                          <Input
                            id="originalPrice"
                            name="originalPrice"
                            type="number"
                            step="0.01"
                            value={formData.originalPrice}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            className="border-gray-300"
                            disabled={formData.hasVariants}
                          />
                          {formData.hasVariants && <p className="text-xs text-gray-500">MRP is managed by variants.</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Selling Price (₹) *</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            required={!formData.hasVariants}
                            className="border-gray-300"
                            disabled={formData.hasVariants}
                          />
                          {formData.hasVariants && (
                            <p className="text-xs text-gray-500">Selling Price is managed by variants.</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxPercentage">Tax Percentage</Label>
                          <Input
                            id="taxPercentage"
                            name="taxPercentage"
                            type="number"
                            step="0.01"
                            value={formData.taxPercentage}
                            onChange={handleInputChange}
                            placeholder="0"
                            className="border-gray-300"
                          />
                        </div>
                      </div>
                      {/* Stock fields only show when quantity tracking is enabled */}
                      {formData.trackQuantity && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input
                              id="stock"
                              name="stock"
                              type="number"
                              value={formData.stock}
                              onChange={handleInputChange}
                              placeholder="0"
                              required={!formData.hasVariants && formData.trackQuantity}
                              className="border-gray-300"
                              disabled={formData.hasVariants}
                            />
                            {formData.hasVariants && (
                              <p className="text-xs text-gray-500">Stock is managed by variants.</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                            <Input
                              id="lowStockAlert"
                              name="lowStockAlert"
                              type="number"
                              value={formData.lowStockAlert}
                              onChange={handleInputChange}
                              placeholder="5"
                              className="border-gray-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              name="weight"
                              type="number"
                              step="0.01"
                              value={formData.weight}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              className="border-gray-300"
                            />
                          </div>
                        </div>
                      )}
                      {!formData.trackQuantity && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            <p className="text-sm text-blue-800 font-medium">Quantity Tracking Disabled</p>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            Stock quantities are not being tracked for this product. This is suitable for digital
                            products, services, or items with unlimited availability.
                          </p>
                        </div>
                      )}
                      {formData.trackQuantity && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="allowBackorders"
                            checked={formData.allowBackorders}
                            onCheckedChange={(checked) => handleCheckboxChange("allowBackorders", checked as boolean)}
                          />
                          <Label htmlFor="allowBackorders" className="text-sm">
                            Allow backorders when out of stock
                          </Label>
                        </div>
                      )}
                      {/* Dimensions */}
                      <div className="space-y-2">
                        <Label>Dimensions (cm)</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            name="dimensions.length"
                            type="number"
                            value={formData.dimensions.length}
                            onChange={handleInputChange}
                            placeholder="Length"
                            className="border-gray-300"
                          />
                          <Input
                            name="dimensions.width"
                            type="number"
                            value={formData.dimensions.width}
                            onChange={handleInputChange}
                            placeholder="Width"
                            className="border-gray-300"
                          />
                          <Input
                            name="dimensions.height"
                            type="number"
                            value={formData.dimensions.height}
                            onChange={handleInputChange}
                            placeholder="Height"
                            className="border-gray-300"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    {/* Images Tab */}
                    <TabsContent value="media" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Product Images</Label>
                        <p className="text-sm text-gray-500">
                          Upload high-quality images of your product. The first image will be used as the main
                          thumbnail.
                        </p>
                      </div>
                      <ImageUpload images={images} onImagesChange={setImages} maxImages={10} />
                    </TabsContent>
                    {/* Variants Tab */}
                    <TabsContent value="variants" className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id="hasVariants"
                          checked={formData.hasVariants}
                          onCheckedChange={(checked) => {
                            handleCheckboxChange("hasVariants", checked as boolean)
                          }}
                        />
                        <Label htmlFor="hasVariants" className="text-sm">
                          This product has variants (e.g., different sizes, colors)
                        </Label>
                      </div>
                      {formData.hasVariants && (
                        <>
                          {/* Variant Attributes Section */}
                          <Card className="border border-gray-200 shadow-sm mb-4">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-base font-semibold">Variant Attributes</CardTitle>
                              <Button type="button" size="sm" onClick={handleAddVariantAttribute}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Attribute
                              </Button>
                            </CardHeader>
                            <CardContent className="p-4">
                              {formData.variantAttributes.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm">
                                  Define attributes like "Size" or "Color" for your product variants.
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {formData.variantAttributes.map((attribute, index) => (
                                    <div key={index} className="flex items-end gap-2">
                                      <div className="flex-1 space-y-2">
                                        <Label htmlFor={`attribute-name-${index}`}>Attribute Name</Label>
                                        <Input
                                          id={`attribute-name-${index}`}
                                          value={attribute.name}
                                          onChange={(e) => handleVariantAttributeNameChange(index, e.target.value)}
                                          placeholder="e.g., Size, Color"
                                        />
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <Label htmlFor={`attribute-values-${index}`}>Values (comma-separated)</Label>
                                        <Input
                                          id={`attribute-values-${index}`}
                                          value={attribute.values.join(", ")}
                                          onChange={(e) => handleVariantAttributeValuesChange(index, e.target.value)}
                                          placeholder="e.g., S, M, L or Red, Blue"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemoveVariantAttribute(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          {/* Product Variants Table */}
                          <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-base font-semibold">Product Variants</CardTitle>
                              <Button type="button" size="sm" onClick={generateVariantCombinations}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Generate Variants
                              </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                              {formData.variants.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                  Define variant attributes above and click "Generate Variants" to create combinations.
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Variant Name</TableHead>
                                        <TableHead>Selling Price</TableHead>
                                        {formData.trackQuantity && <TableHead>Stock</TableHead>}
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {formData.variants.map((variant, index) => (
                                        <TableRow key={variant._id || index}>
                                          <TableCell className="font-medium">{safeToString(variant.name)}</TableCell>
                                          <TableCell>
                                            <div className="flex flex-col">
                                              <span className="font-semibold">
                                                {formatCurrency(safeToNumber(variant.price))}
                                              </span>
                                              {variant.originalPrice &&
                                                safeToNumber(variant.originalPrice) > safeToNumber(variant.price) && (
                                                  <span className="text-xs text-gray-500 line-through">
                                                    {formatCurrency(safeToNumber(variant.originalPrice))}
                                                  </span>
                                                )}
                                            </div>
                                          </TableCell>
                                          {formData.trackQuantity && (
                                            <TableCell>{safeToString(variant.stock || "0")}</TableCell>
                                          )}
                                          <TableCell>
                                            <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                              {safeToString(variant.sku)}
                                            </code>
                                          </TableCell>
                                          <TableCell>
                                            {variant.image ? (
                                              <img
                                                src={variant.image || "/placeholder.svg"}
                                                alt={safeToString(variant.name)}
                                                className="w-10 h-10 object-cover rounded"
                                              />
                                            ) : (
                                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                                No Img
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant={variant.isActive ? "default" : "secondary"}>
                                              {variant.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                  <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditVariantClick(variant)}>
                                                  <Edit className="h-4 w-4 mr-2" />
                                                  Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  onClick={() => handleDeleteVariant(variant)}
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
                        </>
                      )}
                    </TabsContent>
                    {/* SEO Tab */}
                    <TabsContent value="seo" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <Input
                          id="metaTitle"
                          name="metaTitle"
                          value={formData.metaTitle}
                          onChange={handleInputChange}
                          placeholder="SEO title (max 60 characters)"
                          maxLength={60}
                          className="border-gray-300"
                        />
                        <p className="text-xs text-gray-500">{formData.metaTitle.length}/60 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea
                          id="metaDescription"
                          name="metaDescription"
                          value={formData.metaDescription}
                          onChange={handleInputChange}
                          placeholder="SEO description (max 160 characters)"
                          maxLength={160}
                          rows={3}
                          className="border-gray-300"
                        />
                        <p className="text-xs text-gray-500">{formData.metaDescription.length}/160 characters</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  {/* Form Actions */}
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
                        ? editingProduct
                          ? "Updating..."
                          : "Creating..."
                        : editingProduct
                          ? "Update Product"
                          : "Create Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            {/* Variant Add/Edit Dialog */}
            <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
              <DialogContent className="max-w-full sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingVariant?._id ? "Edit Variant" : "Add New Variant"}</DialogTitle>
                  <DialogDescription>Define the details for this product variant.</DialogDescription>
                </DialogHeader>
                {editingVariant && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="variantName">Variant Name</Label>
                      <Input
                        id="variantName"
                        name="name"
                        value={safeToString(editingVariant.name)}
                        readOnly // Make read-only as it's derived
                        className="bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">
                        This name is automatically generated from variant options.
                      </p>
                    </div>
                    {/* Display Variant Options (Read-only) */}
                    <div className="space-y-2">
                      <Label>Variant Options</Label>
                      <div className="flex flex-wrap gap-2">
                        {editingVariant.options.length > 0 ? (
                          editingVariant.options.map((option, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm">
                              {option.attributeName}: {option.value}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No options defined for this variant.</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="variantOriginalPrice">MRP (₹)</Label>
                        <Input
                          id="variantOriginalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          value={safeToString(editingVariant.originalPrice || "")}
                          onChange={handleVariantFormChange}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variantPrice">Selling Price (₹) *</Label>
                        <Input
                          id="variantPrice"
                          name="price"
                          type="number"
                          step="0.01"
                          value={safeToString(editingVariant.price)}
                          onChange={handleVariantFormChange}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.trackQuantity && (
                        <div className="space-y-2">
                          <Label htmlFor="variantStock">Stock Quantity *</Label>
                          <Input
                            id="variantStock"
                            name="stock"
                            type="number"
                            value={safeToString(editingVariant.stock || "")}
                            onChange={handleVariantFormChange}
                            placeholder="0"
                            required={formData.trackQuantity}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="variantSku">SKU *</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="variantSku"
                            name="sku"
                            value={safeToString(editingVariant.sku)}
                            onChange={handleVariantFormChange}
                            placeholder="e.g., TSHIRT-RED-L"
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateVariantSKU}
                            className="px-3 bg-transparent"
                            title="Auto-generate variant SKU"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="variantIsActive"
                        name="isActive"
                        checked={editingVariant.isActive}
                        onCheckedChange={(checked) =>
                          handleVariantFormChange({
                            target: { name: "isActive", type: "checkbox", checked },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                      />
                      <Label htmlFor="variantIsActive">Variant is Active</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Variant Image (Optional)</Label>
                      <p className="text-sm text-gray-500">
                        Upload an image specific to this variant (e.g., a red shirt for a red color variant).
                      </p>
                      <ImageUpload
                        key={variantImageUploadKey}
                        images={editingVariant.image ? [editingVariant.image] : []}
                        onImagesChange={handleVariantImageChange}
                        maxImages={1}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSaveVariant}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Variant
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* View Product Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-full md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="flex items-center space-x-2 text-slate-900">
                <Eye className="h-5 w-5 text-slate-600" />
                <span>Product Details</span>
              </DialogTitle>
            </DialogHeader>
            {viewingProduct && (
              <div className="space-y-6 pt-4">
                {/* Product Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Product Images</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {viewingProduct.gallery?.map((image, index) => (
                        <img
                          key={index}
                          src={image || "/placeholder.svg"}
                          alt={`${viewingProduct.name} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Product Name</p>
                        <p className="font-medium">{viewingProduct.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">SKU</p>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">{viewingProduct.sku}</code>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <Badge variant="outline">{viewingProduct.category.name}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge
                          variant={viewingProduct.isActive ? "default" : "secondary"}
                          className={`text-xs ${
                            viewingProduct.isActive
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {viewingProduct.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity Tracking</p>
                        <Badge
                          variant={viewingProduct.trackQuantity ? "default" : "secondary"}
                          className={`text-xs ${
                            viewingProduct.trackQuantity
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {viewingProduct.trackQuantity ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 mb-2">{viewingProduct.shortDescription}</p>
                  <p className="text-gray-600 text-sm">{viewingProduct.description}</p>
                </div>
                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Selling Price:</span>
                        <span className="font-semibold">{formatCurrency(viewingProduct.price)}</span>
                      </div>
                      {viewingProduct.originalPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">MRP:</span>
                          <span className="line-through text-gray-400">
                            {formatCurrency(viewingProduct.originalPrice)}
                          </span>
                        </div>
                      )}
                      {viewingProduct.taxPercentage && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tax:</span>
                          <span>{viewingProduct.taxPercentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {viewingProduct.trackQuantity && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Stock Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Stock Quantity:</span>
                          <span className="font-semibold">{viewingProduct.stock || 0} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Stock Status:</span>
                          <Badge className={getStockStatusColor(viewingProduct)}>
                            {getStockStatusText(viewingProduct)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Low Stock Alert:</span>
                          <span>{viewingProduct.lowStockAlert} units</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Variant Attributes Display */}
                {viewingProduct.hasVariants && viewingProduct.variantAttributes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Variant Attributes</h3>
                    <div className="space-y-2">
                      {viewingProduct.variantAttributes.map((attr, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="font-medium">{attr.name}:</span>
                          <div className="flex flex-wrap gap-1">
                            {attr.values.map((val, valIdx) => (
                              <Badge key={valIdx} variant="outline">
                                {val}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Variants Display */}
                {viewingProduct.hasVariants && viewingProduct.variants.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Variants</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Options</TableHead>
                            <TableHead>Selling Price</TableHead>
                            {viewingProduct.trackQuantity && <TableHead>Stock</TableHead>}
                            <TableHead>SKU</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingProduct.variants.map((variant, index) => (
                            <TableRow key={variant._id || index}>
                              <TableCell className="font-medium">{safeToString(variant.name)}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {variant.options?.map((opt, optIdx) => (
                                    <Badge key={optIdx} variant="secondary" className="text-xs">
                                      {opt.attributeName}: {opt.value}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{formatCurrency(safeToNumber(variant.price))}</span>
                                  {variant.originalPrice &&
                                    safeToNumber(variant.originalPrice) > safeToNumber(variant.price) && (
                                      <span className="text-xs text-gray-500 line-through">
                                        {formatCurrency(safeToNumber(variant.originalPrice))}
                                      </span>
                                    )}
                                </div>
                              </TableCell>
                              {viewingProduct.trackQuantity && (
                                <TableCell>{safeToString(variant.stock || "0")}</TableCell>
                              )}
                              <TableCell>
                                <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                  {safeToString(variant.sku)}
                                </code>
                              </TableCell>
                              <TableCell>
                                {variant.image ? (
                                  <img
                                    src={variant.image || "/placeholder.svg"}
                                    alt={safeToString(variant.name)}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                    No Img
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={variant.isActive ? "default" : "secondary"}>
                                  {variant.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                {/* Tags */}
                {viewingProduct.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Offer */}
                {viewingProduct.offer && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Active Offer</h3>
                    <Badge variant="outline" className="text-sm">
                      {viewingProduct.offer.name} - {viewingProduct.offer.value}
                      {viewingProduct.offer.type === "percentage" ? "%" : "₹"} off
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Filters */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name, SKU, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-40 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-36 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Products Table */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Package className="h-5 w-5 text-slate-800" />
              Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="animate-bounce">
                    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="h-10 w-10 text-slate-400" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "No products match your filters"
                    : "No products yet"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Your products will appear here when you start adding them to your inventory."}
                </p>
                {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && (
                  <Button
                    onClick={() => {
                      resetForm()
                      setDialogOpen(true)
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white mb-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-medium text-slate-700 min-w-[180px]">Product</TableHead>
                      <TableHead className="font-medium text-slate-700 min-w-[100px]">SKU</TableHead>
                      <TableHead className="font-medium text-slate-700 min-w-[120px]">Category</TableHead>
                      <TableHead className="font-medium text-slate-700 min-w-[120px]">Price</TableHead>
                      <TableHead className="font-medium text-slate-700 min-w-[120px]">Stock</TableHead>
                      <TableHead className="font-medium text-slate-700 min-w-[100px]">Offer</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {(() => {
                              const displayImage =
                                product.thumbnail ||
                                (product.hasVariants && product.variants.length > 0
                                  ? product.variants.find((v) => v.image)?.image
                                  : null) ||
                                "/placeholder.svg"
                              return (
                                <img
                                  src={displayImage || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                />
                              )
                            })()}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate">{product.name}</p>
                              <p className="text-sm text-gray-500 truncate max-w-[200px]">{product.shortDescription}</p>
                              {product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {product.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {product.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{product.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{product.sku}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                              {product.hasVariants
                                ? formatCurrency(product.lowestVariantPrice || 0)
                                : formatCurrency(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 line-through">
                                  {formatCurrency(product.originalPrice)}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                  off
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStockStatusColor(product)}>
                            {getStockStatusText(product)}
                            {product.trackQuantity && !product.hasVariants && product.stock !== undefined
                              ? ` (${product.stock})`
                              : product.trackQuantity && product.hasVariants
                                ? ` (${product.variants.reduce((sum, v) => sum + safeToNumber(v.stock), 0)})`
                                : ""}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.offer ? (
                            <Badge variant="outline" className="text-xs">
                              {product.offer.value}
                              {product.offer.type === "percentage" ? "%" : "₹"} off
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">No offer</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(product)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Product
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(product._id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  showToast(
                                    "Feature Coming Soon",
                                    "Print Label functionality will be available soon.",
                                    "info",
                                  )
                                }
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Print Label
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
