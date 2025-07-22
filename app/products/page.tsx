"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import type React from "react"
import { useState, useEffect } from "react"
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
  AlertTriangle,
  Download,
  Upload,
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
  stock: number
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
  options?: string[] // Backend field
  price: string
  originalPrice?: string
  stock: string
  sku: string
  isActive: boolean
  image: string
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
    variants: [] as ProductVariant[],
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

  // Enhanced API error handling
  const handleApiError = (endpoint: string, response: Response, data?: any): string => {
    console.error(`❌ API Error for ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    })

    let errorMessage = "Something went wrong. Please try again."

    // Handle specific error messages from the server
    if (data?.error) {
      errorMessage = data.error
    } else if (data?.message) {
      errorMessage = data.message
    } else {
      // Fallback based on status codes
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
        case 502:
          errorMessage = "Bad gateway. The server is temporarily unavailable."
          break
        case 503:
          errorMessage = "Service unavailable. Please try again later."
          break
        default:
          errorMessage = `Request failed with status ${response.status}. Please try again.`
      }
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
    const variantName = editingVariant.name
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6)
    const timestamp = Date.now().toString().slice(-4)
    const newSKU = `${baseSKU}-${variantName}${timestamp}`

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
      console.log(`✅ Loaded ${Array.isArray(data) ? data.length : 0} products`)
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
      console.log(`✅ Loaded ${Array.isArray(data) ? data.length : 0} categories`)
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
      console.log(`✅ Loaded ${Array.isArray(data) ? data.length : 0} offers`)
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category._id === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        filtered = filtered.filter((product) => product.isActive)
      } else if (selectedStatus === "inactive") {
        filtered = filtered.filter((product) => !product.isActive)
      } else if (selectedStatus === "low-stock") {
        filtered = filtered.filter((product) => product.stock <= product.lowStockAlert)
      } else if (selectedStatus === "out-of-stock") {
        filtered = filtered.filter((product) => product.stock === 0 && !product.allowBackorders)
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
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
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
  const handleAddVariantClick = () => {
    setEditingVariant({
      name: "",
      price: "",
      originalPrice: "",
      stock: "",
      sku: "",
      isActive: true,
      image: "",
    })
    setVariantImageUploadKey((prev) => prev + 1)
    setIsVariantDialogOpen(true)
  }

  const handleEditVariantClick = (variant: ProductVariant) => {
    setEditingVariant({ ...variant })
    setVariantImageUploadKey((prev) => prev + 1)
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
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }
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

    // Basic validation for variant
    if (!editingVariant.name || !editingVariant.price || !editingVariant.stock || !editingVariant.sku) {
      showToast("Validation Error", "Variant name, price, stock, and SKU are required.", "error")
      return
    }

    // Check for duplicate SKU
    const isDuplicateSKU = formData.variants.some((v) => v.sku === editingVariant.sku && v._id !== editingVariant._id)
    if (isDuplicateSKU) {
      showToast("Duplicate SKU", "This SKU is already used by another variant.", "error")
      return
    }

    const variantToSave = {
      ...editingVariant,
      options: [editingVariant.name], // Backend expects options as an array
    }

    setFormData((prev) => {
      const existingIndex = prev.variants.findIndex((v) => v._id === editingVariant._id)
      if (existingIndex !== -1) {
        // Update existing variant
        const updatedVariants = [...prev.variants]
        updatedVariants[existingIndex] = variantToSave
        return { ...prev, variants: updatedVariants }
      } else {
        // Add new variant
        const newVariantWithId = { ...variantToSave, _id: `temp-${Date.now()}-${Math.random()}` }
        return { ...prev, variants: [...prev.variants, newVariantWithId] }
      }
    })

    showToast("Variant Saved", `Variant '${editingVariant.name}' has been saved.`, "success")
    setIsVariantDialogOpen(false)
    setEditingVariant(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Enhanced validation
    if (!formData.name.trim()) {
      showToast("Validation Error", "Product name is required.", "error")
      return
    }

    if (!formData.sku.trim()) {
      showToast("Validation Error", "SKU is required.", "error")
      return
    }

    if (!formData.category) {
      showToast("Category Required", "Please select a product category.", "error")
      return
    }

    if (!formData.hasVariants) {
      // Validate main product fields if not using variants
      if (!formData.price || Number(formData.price) <= 0) {
        showToast("Validation Error", "Price must be greater than 0.", "error")
        return
      }

      if (!formData.stock || Number(formData.stock) < 0) {
        showToast("Validation Error", "Stock quantity cannot be negative.", "error")
        return
      }

      // Check for images - required for new products, optional for updates
      if (!editingProduct && images.length === 0) {
        showToast("Images Required", "Please upload at least one product image.", "error")
        return
      }
    } else {
      // Validate variants
      if (formData.variants.length === 0) {
        showToast("Variants Required", "Please add at least one variant.", "error")
        return
      }

      // Validate each variant
      for (const variant of formData.variants) {
        if (!variant.name || !variant.price || !variant.stock || !variant.sku) {
          showToast(
            "Variant Validation Error",
            `All variant fields are required for '${variant.name || "unnamed variant"}'.`,
            "error",
          )
          return
        }
      }

      // For variants, check if at least one image exists (either main product images or variant images)
      const hasMainImages = images.length > 0
      const hasVariantImages = formData.variants.some((variant) => variant.image && variant.image.trim() !== "")

      if (!editingProduct && !hasMainImages && !hasVariantImages) {
        showToast("Images Required", "Please upload at least one image for the product or its variants.", "error")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "dimensions") {
          submitData.append(key, JSON.stringify(value))
        } else if (key === "variants") {
          submitData.append(key, JSON.stringify(value))
        } else if (typeof value === "boolean") {
          submitData.append(key, value.toString())
        } else if (value !== "") {
          submitData.append(key, value as string)
        }
      })

      // Add tags
      submitData.append("tags", JSON.stringify(tags))

      // Add images - always include the images array, even if empty
      if (images.length > 0) {
        images.forEach((imageUrl) => {
          submitData.append("existingImages", imageUrl)
        })
      } else {
        // Send empty array to indicate no images
        submitData.append("existingImages", JSON.stringify([]))
      }

      // Add offer only if it's not "none"
      if (formData.offer && formData.offer !== "none") {
        submitData.append("offer", formData.offer)
      }

      const url = editingProduct
        ? `${API_BASE_URL}/api/admin/products/${editingProduct._id}`
        : `${API_BASE_URL}/api/admin/products`
      const method = editingProduct ? "PUT" : "POST"

      console.log(`📝 Submitting product data:`, {
        method,
        url,
        hasImages: images.length > 0,
        imageCount: images.length,
        hasVariants: formData.hasVariants,
        variantCount: formData.variants.length,
      })

      const { response, data } = await makeApiRequest(url, {
        method,
        body: submitData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        showToast(
          editingProduct ? "Product Updated" : "Product Created",
          `Product "${data.name || formData.name}" has been ${editingProduct ? "updated" : "created"} successfully.`,
          "success",
        )
        setDialogOpen(false)
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      console.error("❌ Submit error:", error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."

      // Provide more specific error messages based on the error
      if (errorMessage.includes("image") || errorMessage.includes("Image")) {
        showToast("Image Error", errorMessage, "error")
      } else if (errorMessage.includes("validation") || errorMessage.includes("required")) {
        showToast("Validation Error", errorMessage, "error")
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
      name: product.name,
      sku: product.sku,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      taxPercentage: product.taxPercentage?.toString() || "",
      stock: product.stock.toString(),
      lowStockAlert: product.lowStockAlert?.toString() || "5",
      allowBackorders: product.allowBackorders || false,
      category: product.category._id,
      offer: product.offer?._id || "none",
      weight: product.weight?.toString() || "",
      dimensions: {
        length: product.dimensions?.length?.toString() || "",
        width: product.dimensions?.width?.toString() || "",
        height: product.dimensions?.height?.toString() || "",
      },
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      hasVariants: product.hasVariants || false,
      variants: product.variants || [],
    })
    setImages(product.gallery || [])
    setTags(product.tags || [])
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

  const getStockStatusColor = (stock: number, lowStockAlert: number, allowBackorders: boolean) => {
    if (stock === 0 && !allowBackorders) {
      return "bg-red-50 text-red-700 border border-red-200"
    } else if (stock <= lowStockAlert && stock > 0) {
      return "bg-amber-50 text-amber-700 border border-amber-200"
    } else if (stock > 0) {
      return "bg-green-50 text-green-700 border border-green-200"
    }
    return "bg-gray-50 text-gray-700 border border-gray-200"
  }

  const getStockStatusText = (stock: number, lowStockAlert: number, allowBackorders: boolean) => {
    if (stock === 0 && !allowBackorders) {
      return "Out of Stock"
    } else if (stock <= lowStockAlert && stock > 0) {
      return "Low Stock"
    } else if (stock > 0) {
      return "In Stock"
    } else if (stock === 0 && allowBackorders) {
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-800"></div>
            <p className="text-gray-500 text-sm">Loading products...</p>
            {Object.keys(apiErrors).length > 0 && (
              <div className="text-center space-y-2">
                <p className="text-red-600 text-sm">Some data failed to load:</p>
                {Object.entries(apiErrors).map(([key, error]) => (
                  <div key={key} className="text-xs text-red-500">
                    {key}: {error}
                  </div>
                ))}
              </div>
            )}
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
        {Object.entries(apiErrors).map(
          ([key, error]) =>
            error && (
              <Card key={key} className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Failed to load {key}</p>
                        <p className="text-xs text-red-600">{error}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(key as "products" | "categories" | "offers")}
                      className="text-red-600 border-red-300 hover:bg-red-100"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ),
        )}

        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
            <p className="text-gray-600 text-sm">Manage your product inventory and catalog</p>
            {apiErrors.products && (
              <p className="text-red-600 text-xs mt-1">⚠️ Product data may be incomplete due to API errors</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
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
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                    <TabsList className="grid w-full grid-cols-5 bg-gray-100">
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
                              {categories.length === 0 && apiErrors.categories ? (
                                <SelectItem value="" disabled>
                                  Failed to load categories
                                </SelectItem>
                              ) : (
                                categories.map((category) => (
                                  <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {apiErrors.categories && <p className="text-xs text-red-600">⚠️ Categories failed to load</p>}
                        </div>

                        <div className="space-y-2">
                          <Label>Offer (Optional)</Label>
                          <Select value={formData.offer} onValueChange={(value) => handleSelectChange("offer", value)}>
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select offer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No offer</SelectItem>
                              {offers.length === 0 && apiErrors.offers ? (
                                <SelectItem value="" disabled>
                                  Failed to load offers
                                </SelectItem>
                              ) : (
                                offers.map((offer) => (
                                  <SelectItem key={offer._id} value={offer._id}>
                                    {offer.name} ({offer.value}
                                    {offer.type === "percentage" ? "%" : offer.type === "flat" ? " off" : ""})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {apiErrors.offers && <p className="text-xs text-red-600">⚠️ Offers failed to load</p>}
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
                            <p className="text-xs text-gray-500">Price is managed by variants.</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="originalPrice">Original Price (₹)</Label>
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
                          {formData.hasVariants && (
                            <p className="text-xs text-gray-500">Original price is managed by variants.</p>
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
                            required={!formData.hasVariants}
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
                            if (!checked) {
                              setFormData((prev) => ({ ...prev, variants: [] }))
                            }
                          }}
                        />
                        <Label htmlFor="hasVariants" className="text-sm">
                          This product has variants (e.g., different sizes, colors)
                        </Label>
                      </div>

                      {formData.hasVariants && (
                        <Card className="border border-gray-200 shadow-sm">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">Product Variants</CardTitle>
                            <Button type="button" size="sm" onClick={handleAddVariantClick}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Variant
                            </Button>
                          </CardHeader>
                          <CardContent className="p-0">
                            {formData.variants.length === 0 ? (
                              <div className="p-6 text-center text-gray-500 text-sm">
                                No variants added yet. Click "Add Variant" to create one.
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Variant Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {formData.variants.map((variant, index) => (
                                    <TableRow key={variant._id || index}>
                                      <TableCell className="font-medium">{variant.name}</TableCell>
                                      <TableCell>
                                        <div className="flex flex-col">
                                          <span className="font-semibold">
                                            {formatCurrency(Number.parseFloat(variant.price || "0"))}
                                          </span>
                                          {variant.originalPrice &&
                                            Number.parseFloat(variant.originalPrice) >
                                              Number.parseFloat(variant.price) && (
                                              <span className="text-xs text-gray-500 line-through">
                                                {formatCurrency(Number.parseFloat(variant.originalPrice))}
                                              </span>
                                            )}
                                        </div>
                                      </TableCell>
                                      <TableCell>{variant.stock}</TableCell>
                                      <TableCell>
                                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                          {variant.sku}
                                        </code>
                                      </TableCell>
                                      <TableCell>
                                        {variant.image ? (
                                          <img
                                            src={variant.image || "/placeholder.svg"}
                                            alt={variant.name}
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
                            )}
                          </CardContent>
                        </Card>
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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingVariant?._id ? "Edit Variant" : "Add New Variant"}</DialogTitle>
                  <DialogDescription>Define the details for this product variant.</DialogDescription>
                </DialogHeader>
                {editingVariant && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="variantName">Variant Name (e.g., Red / Large) *</Label>
                      <Input
                        id="variantName"
                        name="name"
                        value={editingVariant.name}
                        onChange={handleVariantFormChange}
                        placeholder="e.g., Red / Large"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="variantPrice">Price (₹) *</Label>
                        <Input
                          id="variantPrice"
                          name="price"
                          type="number"
                          step="0.01"
                          value={editingVariant.price}
                          onChange={handleVariantFormChange}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variantOriginalPrice">Original Price (₹)</Label>
                        <Input
                          id="variantOriginalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          value={editingVariant.originalPrice}
                          onChange={handleVariantFormChange}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="variantStock">Stock Quantity *</Label>
                        <Input
                          id="variantStock"
                          name="stock"
                          type="number"
                          value={editingVariant.stock}
                          onChange={handleVariantFormChange}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variantSku">SKU *</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="variantSku"
                            name="sku"
                            value={editingVariant.sku}
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                          <span className="text-gray-500">Original Price:</span>
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
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Stock Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Stock Quantity:</span>
                        <span className="font-semibold">{viewingProduct.stock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Stock Status:</span>
                        <Badge
                          className={getStockStatusColor(
                            viewingProduct.stock,
                            viewingProduct.lowStockAlert,
                            viewingProduct.allowBackorders,
                          )}
                        >
                          {getStockStatusText(
                            viewingProduct.stock,
                            viewingProduct.lowStockAlert,
                            viewingProduct.allowBackorders,
                          )}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Low Stock Alert:</span>
                        <span>{viewingProduct.lowStockAlert} units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants Display */}
                {viewingProduct.hasVariants && viewingProduct.variants.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Variants</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingProduct.variants.map((variant, index) => (
                          <TableRow key={variant._id || index}>
                            <TableCell className="font-medium">{variant.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  {formatCurrency(Number.parseFloat(variant.price || "0"))}
                                </span>
                                {variant.originalPrice &&
                                  Number.parseFloat(variant.originalPrice) > Number.parseFloat(variant.price) && (
                                    <span className="text-xs text-gray-500 line-through">
                                      {formatCurrency(Number.parseFloat(variant.originalPrice))}
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>{variant.stock}</TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{variant.sku}</code>
                            </TableCell>
                            <TableCell>
                              {variant.image ? (
                                <img
                                  src={variant.image || "/placeholder.svg"}
                                  alt={variant.name}
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
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40 border-gray-300">
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
                  <SelectTrigger className="w-36 border-gray-300">
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
                      <TableHead className="font-medium text-slate-700">Product</TableHead>
                      <TableHead className="font-medium text-slate-700">SKU</TableHead>
                      <TableHead className="font-medium text-slate-700">Category</TableHead>
                      <TableHead className="font-medium text-slate-700">Price</TableHead>
                      <TableHead className="font-medium text-slate-700">Stock</TableHead>
                      <TableHead className="font-medium text-slate-700">Status</TableHead>
                      <TableHead className="font-medium text-slate-700">Offer</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail || "/placeholder.svg"}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
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
                            <span className="font-semibold text-slate-800">{formatCurrency(product.price)}</span>
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
                          <div className="flex flex-col space-y-1">
                            <span className="font-medium text-slate-800">{product.stock} units</span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium w-fit ${getStockStatusColor(
                                product.stock,
                                product.lowStockAlert,
                                product.allowBackorders,
                              )}`}
                            >
                              {getStockStatusText(product.stock, product.lowStockAlert, product.allowBackorders)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.isActive ? "default" : "secondary"}
                            className={`text-xs ${
                              product.isActive
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
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
