"use client"

import type React from "react"
import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Store,
  Share2,
  CreditCard,
  Truck,
  Save,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
  Smartphone,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Types
interface GeneralSettings {
  storeName: string
  logo: string
  banner: string
  tagline: string
  supportEmail: string
  supportPhone: string
  storeDescription?: string
  favicon?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  timezone?: string
  currency?: string
  language?: string
}

interface SocialSettings {
  instagram: string
  whatsapp: string
  facebook: string
  twitter?: string
  youtube?: string
  telegram?: string
}

interface PaymentSettings {
  razorpayKeyId: string
  razorpayKeySecret: string
  stripePublicKey: string
  stripeSecretKey: string
  phonePeMerchantId: string
  phonePeSaltKey: string
  phonePeSaltIndex: string
  phonePeEnvironment: "sandbox" | "production"
  phonePeWebhookUrl: string
  codEnabled: boolean
  razorpayEnabled: boolean
  stripeEnabled: boolean
  phonePeEnabled: boolean
  paypalEnabled?: boolean
  paypalClientId?: string
  paypalClientSecret?: string
}

interface ShippingSettings {
  deliveryTime: string
  charges: number
  freeShippingAbove: number
  availabilityArea: string[]
  freeShippingEnabled?: boolean
  zones?: Array<{
    name: string
    areas: string[]
    charge: number
    deliveryTime: string
  }>
}

interface StoreInfo {
  storeId: string
  storeName: string
  logo: string
  banner: string
  industry: string
  isActive: boolean
  storeUrl: string
  adminUrl: string
  owner: {
    name: string
    email: string
    phone: string
    role: string
  }
  general: any
  social: any
  shipping: any
  tenantId: string
}

interface SettingsSection {
  id: string
  name: string
  icon: any
  description: string
}

const settingsNavigation: SettingsSection[] = [
  {
    id: "general",
    name: "General",
    icon: Store,
    description: "Store information & branding",
  },
  {
    id: "social",
    name: "Social Media",
    icon: Share2,
    description: "Social accounts & contact",
  },
  {
    id: "payment",
    name: "Payment",
    icon: CreditCard,
    description: "Payment gateways & methods",
  },
  {
    id: "shipping",
    name: "Shipping",
    icon: Truck,
    description: "Delivery & shipping options",
  },
]

// Skeleton Components
const HeaderSkeleton = () => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <div>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-96 mb-4" />
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="text-right">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

const SidebarSkeleton = () => (
  <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
    <div className="p-6">
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-48 mb-6" />
      <nav className="space-y-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-full flex items-center px-4 py-3 border-r-3 rounded-lg">
            <Skeleton className="h-5 w-5 mr-3 rounded" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ))}
      </nav>
    </div>
  </div>
)

const ContentSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="p-6 space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  </div>
)

const LoadingSkeleton = ({ activeTab }: { activeTab: string }) => (
  <AdminLayout>
    <div className="min-h-screen bg-gray-50">
      <HeaderSkeleton />
      <div className="flex">
        <SidebarSkeleton />
        <div className="flex-1 p-6">
          <ContentSkeleton />
        </div>
      </div>
    </div>
  </AdminLayout>
)

export default function CombinedSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    storeName: "",
    logo: "",
    banner: "",
    tagline: "",
    supportEmail: "",
    supportPhone: "",
  })
  const [socialSettings, setSocialSettings] = useState<SocialSettings>({
    instagram: "",
    whatsapp: "",
    facebook: "",
  })
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    razorpayKeyId: "",
    razorpayKeySecret: "",
    stripePublicKey: "",
    stripeSecretKey: "",
    phonePeMerchantId: "",
    phonePeSaltKey: "",
    phonePeSaltIndex: "",
    phonePeEnvironment: "sandbox",
    phonePeWebhookUrl: "",
    codEnabled: true,
    razorpayEnabled: false,
    stripeEnabled: false,
    phonePeEnabled: false,
  })
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    deliveryTime: "",
    charges: 0,
    freeShippingAbove: 0,
    availabilityArea: [],
  })

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState({
    general: false,
    social: false,
    payment: false,
    shipping: false,
  })
  const [lastSaved, setLastSaved] = useState<Record<string, Date>>({})

  const { toast } = useToast()

  const API_BASE = "https://api.yespstudio.com/api/admin"

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // Update the fetchSettings function to handle payment and shipping data properly
  const fetchSettings = async (section: string) => {
    try {
      const response = await fetch(`${API_BASE}/settings/${section}`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`Fetched ${section} settings:`, data) // Debug log

        switch (section) {
          case "general":
            setGeneralSettings((prev) => ({ ...prev, ...data }))
            break
          case "social":
            setSocialSettings((prev) => ({ ...prev, ...data }))
            break
          case "payment":
            // Handle payment settings with proper mapping
            setPaymentSettings((prev) => ({
              ...prev,
              razorpayKeyId: data.razorpay?.keyId || data.razorpayKeyId || "",
              razorpayKeySecret: data.razorpay?.keySecret || data.razorpayKeySecret || "",
              razorpayEnabled: data.razorpay?.enabled || data.razorpayEnabled || false,
              stripePublicKey: data.stripe?.publishableKey || data.stripePublicKey || "",
              stripeSecretKey: data.stripe?.secretKey || data.stripeSecretKey || "",
              stripeEnabled: data.stripe?.enabled || data.stripeEnabled || false,
              phonePeMerchantId: data.phonepe?.merchantId || data.phonePeMerchantId || "",
              phonePeSaltKey: data.phonepe?.saltKey || data.phonePeSaltKey || "",
              phonePeSaltIndex: data.phonepe?.saltIndex || data.phonePeSaltIndex || "",
              phonePeEnvironment: data.phonepe?.environment || data.phonePeEnvironment || "sandbox",
              phonePeWebhookUrl: data.phonepe?.webhookUrl || data.phonePeWebhookUrl || "",
              phonePeEnabled: data.phonepe?.enabled || data.phonePeEnabled || false,
              codEnabled: data.codEnabled !== undefined ? data.codEnabled : true,
              onlinePaymentEnabled: data.onlinePaymentEnabled !== undefined ? data.onlinePaymentEnabled : false,
            }))
            break
          case "shipping":
            // Handle shipping settings with proper mapping
            setShippingSettings((prev) => ({
              ...prev,
              deliveryTime: data.deliveryTime || "2-3 business days",
              charges: data.charges || 0,
              freeShippingAbove: data.freeShippingAbove || 0,
              freeShippingEnabled: data.freeShippingEnabled || false,
              availabilityArea: Array.isArray(data.availabilityArea) ? data.availabilityArea : [],
              zones: Array.isArray(data.zones) ? data.zones : [],
            }))
            break
        }
      } else {
        console.error(`Failed to fetch ${section} settings:`, response.status)
      }
    } catch (error) {
      console.error(`Error fetching ${section} settings:`, error)
    }
  }

  // Update the updateSettings function to handle proper data structure
  const updateSettings = async (section: string, data: any) => {
    const sectionKey = section as keyof typeof isSubmitting
    setIsSubmitting((prev) => ({ ...prev, [sectionKey]: true }))

    try {
      let requestData = data

      // Transform payment data to match backend structure
      if (section === "payment") {
        requestData = {
          codEnabled: data.codEnabled,
          onlinePaymentEnabled: data.razorpayEnabled || data.stripeEnabled || data.phonePeEnabled,
          razorpay: {
            enabled: data.razorpayEnabled,
            keyId: data.razorpayKeyId,
            keySecret: data.razorpayKeySecret,
          },
          stripe: {
            enabled: data.stripeEnabled,
            publishableKey: data.stripePublicKey,
            secretKey: data.stripeSecretKey,
          },
          phonepe: {
            enabled: data.phonePeEnabled,
            merchantId: data.phonePeMerchantId,
            saltKey: data.phonePeSaltKey,
            saltIndex: data.phonePeSaltIndex,
            environment: data.phonePeEnvironment,
            webhookUrl: data.phonePeWebhookUrl,
          },
          // Also send flat structure for backward compatibility
          razorpayEnabled: data.razorpayEnabled,
          razorpayKeyId: data.razorpayKeyId,
          razorpayKeySecret: data.razorpayKeySecret,
          stripeEnabled: data.stripeEnabled,
          stripePublicKey: data.stripePublicKey,
          stripeSecretKey: data.stripeSecretKey,
          phonePeEnabled: data.phonePeEnabled,
          phonePeMerchantId: data.phonePeMerchantId,
          phonePeSaltKey: data.phonePeSaltKey,
          phonePeSaltIndex: data.phonePeSaltIndex,
          phonePeEnvironment: data.phonePeEnvironment,
          phonePeWebhookUrl: data.phonePeWebhookUrl,
        }
      }

      // Transform shipping data to match backend structure
      if (section === "shipping") {
        requestData = {
          ...data,
          freeShippingEnabled: data.freeShippingAbove > 0,
          availabilityArea: data.availabilityArea.filter((area: string) => area.trim() !== ""),
        }
      }

      console.log(`Updating ${section} settings with data:`, requestData) // Debug log

      const response = await fetch(`${API_BASE}/settings/${section}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log(`${section} settings updated successfully:`, responseData) // Debug log

        setLastSaved((prev) => ({ ...prev, [section]: new Date() }))
        toast({
          title: "Settings updated",
          description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been updated successfully.`,
        })

        // Refresh the specific section data after successful update
        await fetchSettings(section)
        return true
      } else {
        const errorData = await response.json()
        console.error(`Failed to update ${section} settings:`, errorData) // Debug log
        toast({
          title: "Error",
          description: errorData.error || "Failed to update settings",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error(`Error updating ${section} settings:`, error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [sectionKey]: false }))
    }
  }

  // Update fetchStoreInfo to better handle payment and shipping data
  const fetchStoreInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/store-info`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Store data received:", data) // Debug log
        setStoreInfo(data)

        // Update settings from store data with better mapping
        setGeneralSettings((prev) => ({
          ...prev,
          storeName: data.storeName || "",
          logo: data.logo || "",
          banner: data.banner || "",
          tagline: data.general?.tagline || "",
          supportEmail: data.general?.supportEmail || data.owner?.email || "",
          supportPhone: data.general?.supportPhone || data.owner?.phone || "",
          storeDescription: data.general?.storeDescription || "",
          favicon: data.general?.favicon || "",
          timezone: data.general?.timezone || "Asia/Kolkata",
          currency: data.general?.currency || "INR",
          language: data.general?.language || "en",
        }))

        setSocialSettings((prev) => ({
          ...prev,
          instagram: data.social?.instagram || "",
          whatsapp: data.social?.whatsapp || data.owner?.phone || "",
          facebook: data.social?.facebook || "",
          twitter: data.social?.twitter || "",
          youtube: data.social?.youtube || "",
          telegram: data.social?.telegram || "",
        }))

        // Handle payment settings from store data
        if (data.payment) {
          setPaymentSettings((prev) => ({
            ...prev,
            razorpayKeyId: data.payment.razorpay?.keyId || "",
            razorpayKeySecret: data.payment.razorpay?.keySecret || "",
            razorpayEnabled: data.payment.razorpay?.enabled || false,
            stripePublicKey: data.payment.stripe?.publishableKey || "",
            stripeSecretKey: data.payment.stripe?.secretKey || "",
            stripeEnabled: data.payment.stripe?.enabled || false,
            phonePeMerchantId: data.payment.phonepe?.merchantId || "",
            phonePeSaltKey: data.payment.phonepe?.saltKey || "",
            phonePeSaltIndex: data.payment.phonepe?.saltIndex || "",
            phonePeEnvironment: data.payment.phonepe?.environment || "sandbox",
            phonePeWebhookUrl: data.payment.phonepe?.webhookUrl || "",
            phonePeEnabled: data.payment.phonepe?.enabled || false,
            codEnabled: data.payment.codEnabled !== undefined ? data.payment.codEnabled : true,
          }))
        }

        // Handle shipping settings from store data
        if (data.shipping) {
          setShippingSettings((prev) => ({
            ...prev,
            deliveryTime: data.shipping.deliveryTime || "2-3 business days",
            charges: data.shipping.charges || 0,
            freeShippingAbove: data.shipping.freeShippingAbove || 0,
            freeShippingEnabled: data.shipping.freeShippingEnabled || false,
            availabilityArea: Array.isArray(data.shipping.availabilityArea) ? data.shipping.availabilityArea : [],
            zones: Array.isArray(data.shipping.zones) ? data.shipping.zones : [],
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching store info:", error)
      toast({
        title: "Error",
        description: "Failed to load store information",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchAllSettings = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchStoreInfo(),
          fetchSettings("general"),
          fetchSettings("social"),
          fetchSettings("payment"),
          fetchSettings("shipping"),
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchAllSettings()
  }, [])

  const handleGeneralChange = (field: keyof GeneralSettings, value: string) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSocialChange = (field: keyof SocialSettings, value: string) => {
    setSocialSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePaymentChange = (field: keyof PaymentSettings, value: string | boolean) => {
    setPaymentSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleShippingChange = (field: keyof ShippingSettings, value: string | number | string[]) => {
    setShippingSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings("general", generalSettings)
  }

  const updateSocialSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings("social", socialSettings)
  }

  const updatePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings("payment", paymentSettings)
  }

  const updateShippingSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings("shipping", {
      ...shippingSettings,
      availabilityArea: shippingSettings.availabilityArea.filter((area) => area.trim() !== ""),
    })
  }

  if (loading) {
    return <LoadingSkeleton activeTab={activeTab} />
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your store configuration and preferences</p>

            {/* Store Info Banner */}
            {storeInfo && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">{storeInfo.storeName}</h3>
                    <p className="text-sm text-blue-700">Store ID: {storeInfo.storeId}</p>
                    <p className="text-sm text-blue-600">{storeInfo.industry}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        storeInfo.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {storeInfo.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Configuration</h2>
              <p className="text-sm text-gray-600 mb-6">Choose a section to configure</p>
              <nav className="space-y-1">
                {settingsNavigation.map((item) => {
                  const Icon = item.icon
                  const wasRecentlySaved =
                    lastSaved[item.id] && new Date().getTime() - lastSaved[item.id].getTime() < 5000

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center px-4 py-3 text-left transition-all duration-200 hover:bg-gray-50 border-r-3 rounded-lg group",
                        activeTab === item.id
                          ? "bg-blue-50 border-r-blue-600 text-blue-900"
                          : "border-r-transparent text-gray-700 hover:text-gray-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 mr-3 transition-colors",
                          activeTab === item.id ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate">{item.name}</div>
                          {wasRecentlySaved && <CheckCircle className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                    <Store className="h-5 w-5 text-gray-700" />
                    General Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Update your store's basic information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={updateGeneralSettings} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="storeName" className="text-sm font-semibold text-gray-700">
                          Store Name *
                        </Label>
                        <Input
                          id="storeName"
                          value={generalSettings.storeName}
                          onChange={(e) => handleGeneralChange("storeName", e.target.value)}
                          placeholder="Enter your store name"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tagline" className="text-sm font-semibold text-gray-700">
                          Tagline
                        </Label>
                        <Input
                          id="tagline"
                          value={generalSettings.tagline}
                          onChange={(e) => handleGeneralChange("tagline", e.target.value)}
                          placeholder="Your store's tagline"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="logo" className="text-sm font-semibold text-gray-700">
                          Logo URL
                        </Label>
                        <Input
                          id="logo"
                          type="url"
                          value={generalSettings.logo}
                          onChange={(e) => handleGeneralChange("logo", e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="banner" className="text-sm font-semibold text-gray-700">
                          Banner URL
                        </Label>
                        <Input
                          id="banner"
                          type="url"
                          value={generalSettings.banner}
                          onChange={(e) => handleGeneralChange("banner", e.target.value)}
                          placeholder="https://example.com/banner.png"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="supportEmail" className="text-sm font-semibold text-gray-700">
                          Support Email *
                        </Label>
                        <Input
                          id="supportEmail"
                          type="email"
                          value={generalSettings.supportEmail}
                          onChange={(e) => handleGeneralChange("supportEmail", e.target.value)}
                          placeholder="support@yourstore.com"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supportPhone" className="text-sm font-semibold text-gray-700">
                          Support Phone
                        </Label>
                        <Input
                          id="supportPhone"
                          type="tel"
                          value={generalSettings.supportPhone}
                          onChange={(e) => handleGeneralChange("supportPhone", e.target.value)}
                          placeholder="+91-9876543210"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting.general}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting.general ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Social Settings */}
            {activeTab === "social" && (
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                    <Share2 className="h-5 w-5 text-gray-700" />
                    Social Media Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Connect your social media accounts and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={updateSocialSettings} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-sm font-semibold text-gray-700">
                        Instagram URL
                      </Label>
                      <Input
                        id="instagram"
                        type="url"
                        placeholder="https://instagram.com/yourstore"
                        value={socialSettings.instagram}
                        onChange={(e) => handleSocialChange("instagram", e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">
                        WhatsApp Number
                      </Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="+91-9876543210"
                        value={socialSettings.whatsapp}
                        onChange={(e) => handleSocialChange("whatsapp", e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="text-sm font-semibold text-gray-700">
                        Facebook URL
                      </Label>
                      <Input
                        id="facebook"
                        type="url"
                        placeholder="https://facebook.com/yourstore"
                        value={socialSettings.facebook}
                        onChange={(e) => handleSocialChange("facebook", e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting.social}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting.social ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Payment Settings */}
            {activeTab === "payment" && (
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                    <CreditCard className="h-5 w-5 text-gray-700" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Configure payment gateways and methods for your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-sm text-blue-800">
                        <strong>Security Note:</strong> Payment gateway credentials are encrypted and stored securely.
                        Test your configuration before going live.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={updatePaymentSettings} className="space-y-8">
                    {/* Cash on Delivery */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <h3 className="text-base font-semibold text-gray-900">Cash on Delivery</h3>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <Switch
                          id="codEnabled"
                          checked={paymentSettings.codEnabled}
                          onCheckedChange={(checked) => handlePaymentChange("codEnabled", checked)}
                        />
                        <div className="flex-1">
                          <Label htmlFor="codEnabled" className="text-gray-800 font-medium cursor-pointer">
                            Enable Cash on Delivery
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Allow customers to pay when they receive their order
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Razorpay Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-gray-600" />
                          <h3 className="text-base font-semibold text-gray-900">Razorpay Configuration</h3>
                        </div>
                        <Switch
                          checked={paymentSettings.razorpayEnabled}
                          onCheckedChange={(checked) => handlePaymentChange("razorpayEnabled", checked)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="razorpayKeyId" className="text-sm font-semibold text-gray-700">
                            Key ID
                          </Label>
                          <Input
                            id="razorpayKeyId"
                            value={paymentSettings.razorpayKeyId}
                            onChange={(e) => handlePaymentChange("razorpayKeyId", e.target.value)}
                            placeholder="rzp_test_xxxxxxxxxx"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            disabled={!paymentSettings.razorpayEnabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="razorpayKeySecret" className="text-sm font-semibold text-gray-700">
                            Key Secret
                          </Label>
                          <Input
                            id="razorpayKeySecret"
                            type="password"
                            value={paymentSettings.razorpayKeySecret}
                            onChange={(e) => handlePaymentChange("razorpayKeySecret", e.target.value)}
                            placeholder="••••••••••••••••"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            disabled={!paymentSettings.razorpayEnabled}
                          />
                        </div>
                      </div>
                      {paymentSettings.razorpayEnabled && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Razorpay is enabled and configured
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* PhonePe Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-purple-600" />
                          <h3 className="text-base font-semibold text-gray-900">PhonePe Configuration</h3>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">New</Badge>
                        </div>
                        <Switch
                          checked={paymentSettings.phonePeEnabled}
                          onCheckedChange={(checked) => handlePaymentChange("phonePeEnabled", checked)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phonePeMerchantId" className="text-sm font-semibold text-gray-700">
                            Merchant ID
                          </Label>
                          <Input
                            id="phonePeMerchantId"
                            value={paymentSettings.phonePeMerchantId}
                            onChange={(e) => handlePaymentChange("phonePeMerchantId", e.target.value)}
                            placeholder="MERCHANTUAT"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            disabled={!paymentSettings.phonePeEnabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phonePeSaltKey" className="text-sm font-semibold text-gray-700">
                            Salt Key
                          </Label>
                          <Input
                            id="phonePeSaltKey"
                            type="password"
                            value={paymentSettings.phonePeSaltKey}
                            onChange={(e) => handlePaymentChange("phonePeSaltKey", e.target.value)}
                            placeholder="••••••••••••••••"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            disabled={!paymentSettings.phonePeEnabled}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phonePeSaltIndex" className="text-sm font-semibold text-gray-700">
                            Salt Index
                          </Label>
                          <Input
                            id="phonePeSaltIndex"
                            value={paymentSettings.phonePeSaltIndex}
                            onChange={(e) => handlePaymentChange("phonePeSaltIndex", e.target.value)}
                            placeholder="1"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            disabled={!paymentSettings.phonePeEnabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phonePeEnvironment" className="text-sm font-semibold text-gray-700">
                            Environment
                          </Label>
                          <Select
                            value={paymentSettings.phonePeEnvironment}
                            onValueChange={(value: "sandbox" | "production") =>
                              handlePaymentChange("phonePeEnvironment", value)
                            }
                            disabled={!paymentSettings.phonePeEnabled}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select environment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                              <SelectItem value="production">Production (Live)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phonePeWebhookUrl" className="text-sm font-semibold text-gray-700">
                          Webhook URL (Optional)
                        </Label>
                        <Input
                          id="phonePeWebhookUrl"
                          type="url"
                          value={paymentSettings.phonePeWebhookUrl}
                          onChange={(e) => handlePaymentChange("phonePeWebhookUrl", e.target.value)}
                          placeholder="https://yourstore.com/api/phonepe/webhook"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled={!paymentSettings.phonePeEnabled}
                        />
                        <p className="text-xs text-gray-500">URL to receive payment status updates from PhonePe</p>
                      </div>
                      {paymentSettings.phonePeEnabled && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            PhonePe is enabled for {paymentSettings.phonePeEnvironment} environment
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Stripe Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-gray-600" />
                          <h3 className="text-base font-semibold text-gray-900">Stripe Configuration</h3>
                        </div>
                        <Switch
                          checked={paymentSettings.stripeEnabled}
                          onCheckedChange={(checked) => handlePaymentChange("stripeEnabled", checked)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="stripePublicKey" className="text-sm font-semibold text-gray-700">
                            Public Key
                          </Label>
                          <Input
                            id="stripePublicKey"
                            value={paymentSettings.stripePublicKey}
                            onChange={(e) => handlePaymentChange("stripePublicKey", e.target.value)}
                            placeholder="pk_test_xxxxxxxxxx"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            disabled={!paymentSettings.stripeEnabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stripeSecretKey" className="text-sm font-semibold text-gray-700">
                            Secret Key
                          </Label>
                          <Input
                            id="stripeSecretKey"
                            type="password"
                            value={paymentSettings.stripeSecretKey}
                            onChange={(e) => handlePaymentChange("stripeSecretKey", e.target.value)}
                            placeholder="••••••••••••••••"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            disabled={!paymentSettings.stripeEnabled}
                          />
                        </div>
                      </div>
                      {paymentSettings.stripeEnabled && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Stripe is enabled and configured
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Payment Gateway Status */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Active Payment Gateways</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div
                          className={`flex items-center p-3 rounded-lg border ${
                            paymentSettings.codEnabled ? "bg-green-50 border-green-200" : "bg-gray-100 border-gray-200"
                          }`}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">COD</span>
                          {paymentSettings.codEnabled && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                        </div>
                        <div
                          className={`flex items-center p-3 rounded-lg border ${
                            paymentSettings.razorpayEnabled
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-100 border-gray-200"
                          }`}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Razorpay</span>
                          {paymentSettings.razorpayEnabled && (
                            <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                          )}
                        </div>
                        <div
                          className={`flex items-center p-3 rounded-lg border ${
                            paymentSettings.phonePeEnabled
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-100 border-gray-200"
                          }`}
                        >
                          <Smartphone className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="text-sm font-medium">PhonePe</span>
                          {paymentSettings.phonePeEnabled && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                        </div>
                        <div
                          className={`flex items-center p-3 rounded-lg border ${
                            paymentSettings.stripeEnabled
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-100 border-gray-200"
                          }`}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Stripe</span>
                          {paymentSettings.stripeEnabled && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="mt-4 p-3 bg-white rounded border">
                        <h5 className="font-medium text-gray-800 mb-2">Configuration Summary</h5>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Total Active Gateways:</span>
                            <span className="font-medium">
                              {
                                [
                                  paymentSettings.codEnabled,
                                  paymentSettings.razorpayEnabled,
                                  paymentSettings.phonePeEnabled,
                                  paymentSettings.stripeEnabled,
                                ].filter(Boolean).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Online Payment:</span>
                            <span
                              className={`font-medium ${paymentSettings.razorpayEnabled || paymentSettings.stripeEnabled || paymentSettings.phonePeEnabled ? "text-green-600" : "text-red-600"}`}
                            >
                              {paymentSettings.razorpayEnabled ||
                              paymentSettings.stripeEnabled ||
                              paymentSettings.phonePeEnabled
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting.payment}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting.payment ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Shipping Settings */}
            {activeTab === "shipping" && (
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                    <Truck className="h-5 w-5 text-gray-700" />
                    Shipping Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Configure delivery options and shipping policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={updateShippingSettings} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime" className="text-sm font-semibold text-gray-700">
                        Delivery Time
                      </Label>
                      <Input
                        id="deliveryTime"
                        placeholder="2-3 business days"
                        value={shippingSettings.deliveryTime}
                        onChange={(e) => handleShippingChange("deliveryTime", e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="charges" className="text-sm font-semibold text-gray-700">
                          Shipping Charges (₹)
                        </Label>
                        <Input
                          id="charges"
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingSettings.charges}
                          onChange={(e) => handleShippingChange("charges", Number.parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeShippingAbove" className="text-sm font-semibold text-gray-700">
                          Free Shipping Above (₹)
                        </Label>
                        <Input
                          id="freeShippingAbove"
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingSettings.freeShippingAbove}
                          onChange={(e) =>
                            handleShippingChange("freeShippingAbove", Number.parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availabilityArea" className="text-sm font-semibold text-gray-700">
                        Availability Areas
                      </Label>
                      <Textarea
                        id="availabilityArea"
                        placeholder="Chennai, Bangalore, Mumbai, Delhi"
                        value={shippingSettings.availabilityArea.join(", ")}
                        onChange={(e) =>
                          handleShippingChange(
                            "availabilityArea",
                            e.target.value.split(",").map((area) => area.trim()),
                          )
                        }
                        rows={4}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500">Enter areas separated by commas</p>
                    </div>

                    {/* Free Shipping Toggle */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Switch
                        id="freeShippingEnabled"
                        checked={shippingSettings.freeShippingAbove > 0}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            handleShippingChange("freeShippingAbove", 0)
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor="freeShippingEnabled" className="text-gray-800 font-medium cursor-pointer">
                          Enable Free Shipping
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Offer free shipping when order value exceeds the specified amount
                        </p>
                      </div>
                    </div>

                    {/* Shipping Summary */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-3">Shipping Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Standard Shipping:</span>
                          <span className="font-medium text-blue-900">₹{shippingSettings.charges}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Free Shipping Above:</span>
                          <span className="font-medium text-blue-900">
                            {shippingSettings.freeShippingAbove > 0
                              ? `₹${shippingSettings.freeShippingAbove}`
                              : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Delivery Time:</span>
                          <span className="font-medium text-blue-900">
                            {shippingSettings.deliveryTime || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Service Areas:</span>
                          <span className="font-medium text-blue-900">
                            {shippingSettings.availabilityArea.length} areas
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting.shipping}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting.shipping ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
