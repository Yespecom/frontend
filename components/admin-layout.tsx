"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { HelpCircle, ChevronDown, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminLayoutProps {
  children: React.ReactNode
}

// Global data context for instant access
interface AppDataContext {
  dashboard: any
  products: any[]
  orders: any[]
  customers: any[]
  categories: any[]
  offers: any[]
  payments: any[]
  analytics: any
  storeInfo: any
  isDataLoaded: boolean
  loadingStates: Record<string, boolean>
  refreshData: (section?: string) => Promise<void>
}

const AppDataContext = createContext<AppDataContext | null>(null)

export const useAppData = () => {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error("useAppData must be used within AdminLayout")
  }
  return context
}

// FAQ data
const faqData = [
  {
    id: 1,
    question: "How do I add a new product?",
    answer:
      "Go to Products → Click 'Add Product' → Fill in product details (name, price, description) → Upload images → Set inventory → Click 'Save & Publish'",
  },
  {
    id: 2,
    question: "How do I process pending orders?",
    answer:
      "Go to Orders → Filter by 'Pending' status → Click on an order → Update status to 'Processing' or 'Shipped' → Save changes",
  },
  {
    id: 3,
    question: "How do I manage inventory?",
    answer:
      "Go to Products → Click on any product → Update stock quantity → Set low stock alerts → Save changes. You can also bulk update inventory.",
  },
  {
    id: 4,
    question: "How do I set up payment methods?",
    answer:
      "Go to Settings → Payment Methods → Enable Razorpay/Stripe → Enter API keys → Configure payment options → Test and activate",
  },
  {
    id: 5,
    question: "How do I create discount offers?",
    answer:
      "Go to Offers → Click 'Create Offer' → Choose discount type (percentage/fixed) → Set conditions → Set validity period → Activate offer",
  },
  {
    id: 6,
    question: "How do I view sales analytics?",
    answer:
      "Go to Dashboard → View revenue charts → Check order statistics → Analyze customer data → Export reports if needed",
  },
  {
    id: 7,
    question: "How do I manage customer accounts?",
    answer:
      "Go to Customers → View customer list → Click on customer → Edit details → View order history → Manage customer status",
  },
  {
    id: 8,
    question: "How do I organize products into categories?",
    answer:
      "Go to Categories → Create new category → Add category details → Go to Products → Assign products to categories → Save changes",
  },
  {
    id: 9,
    question: "How do I handle refunds?",
    answer:
      "Go to Orders → Find the order → Click 'Refund' → Enter refund amount → Select refund reason → Process refund through payment gateway",
  },
  {
    id: 10,
    question: "How do I update store settings?",
    answer:
      "Go to Settings → Update store information → Configure shipping rates → Set tax settings → Update contact details → Save all changes",
  },
]

// FAQ Help Button Component
function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (faqId: number) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId)
  }

  const handleHelpClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={handleHelpClick}
        className="p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all duration-150 group"
      >
        <HelpCircle className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-150" />
        <span className="sr-only">Help & FAQs</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-12 right-0 z-40 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <HelpCircle className="w-4 h-4 text-blue-600 mr-2" />
                Frequently Asked Questions
              </h3>
              <p className="text-xs text-gray-600 mt-1">Quick answers to common questions</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {faqData.map((faq) => (
                <div key={faq.id} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-100 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-800 pr-2">{faq.question}</span>
                    {expandedFaq === faq.id ? (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-500 text-center">
                Need more help? Contact support at{" "}
                <a href="mailto:support@yesp.com" className="text-blue-600 hover:underline">
                  support@yesp.com
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Loading skeleton for main content
function MainContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-4" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Authentication loading component for content area
function AuthLoadingContent() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600">Authenticating...</p>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Global app data state with loading states
  const [appData, setAppData] = useState<AppDataContext>({
    dashboard: null,
    products: [],
    orders: [],
    customers: [],
    categories: [],
    offers: [],
    payments: [],
    analytics: null,
    storeInfo: null,
    isDataLoaded: false,
    loadingStates: {
      dashboard: true,
      products: true,
      orders: true,
      customers: true,
      categories: true,
      offers: true,
      payments: true,
      analytics: true,
      storeInfo: true,
    },
    refreshData: async () => {},
  })

  // Fetch individual data section
  const fetchDataSection = async (token: string, section: string, url: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAppData((prev) => ({
          ...prev,
          [section]: data,
          loadingStates: {
            ...prev.loadingStates,
            [section]: false,
          },
        }))
      } else {
        // Set empty data for failed requests
        const emptyData = ["products", "orders", "customers", "categories", "offers", "payments"].includes(section)
          ? []
          : null
        setAppData((prev) => ({
          ...prev,
          [section]: emptyData,
          loadingStates: {
            ...prev.loadingStates,
            [section]: false,
          },
        }))
      }
    } catch (error) {
      console.error(`Error fetching ${section}:`, error)
      const emptyData = ["products", "orders", "customers", "categories", "offers", "payments"].includes(section)
        ? []
        : null
      setAppData((prev) => ({
        ...prev,
        [section]: emptyData,
        loadingStates: {
          ...prev.loadingStates,
          [section]: false,
        },
      }))
    }
  }

  // Load all data progressively
  const loadAllData = async (token: string) => {
    const endpoints = [
      { key: "storeInfo", url: "https://api.yespstudio.com/api/admin/store-info" },
      { key: "dashboard", url: "https://api.yespstudio.com/api/admin/stats" },
      { key: "products", url: "https://api.yespstudio.com/api/admin/products" },
      { key: "orders", url: "https://api.yespstudio.com/api/admin/orders" },
      { key: "customers", url: "https://api.yespstudio.com/api/admin/customers" },
      { key: "categories", url: "https://api.yespstudio.com/api/admin/categories" },
      { key: "offers", url: "https://api.yespstudio.com/api/admin/offers" },
      { key: "payments", url: "https://api.yespstudio.com/api/admin/payments" },
      { key: "analytics", url: "https://api.yespstudio.com/api/admin/dashboard/analytics" },
    ]

    // Load critical data first (storeInfo, dashboard)
    const criticalEndpoints = endpoints.slice(0, 2)
    const nonCriticalEndpoints = endpoints.slice(2)

    // Load critical data first
    await Promise.all(criticalEndpoints.map((endpoint) => fetchDataSection(token, endpoint.key, endpoint.url)))

    // Then load non-critical data with slight delays for smoother UX
    nonCriticalEndpoints.forEach((endpoint, index) => {
      setTimeout(() => {
        fetchDataSection(token, endpoint.key, endpoint.url)
      }, index * 100) // Stagger loading by 100ms
    })

    // Mark as loaded after critical data is loaded
    setTimeout(() => {
      setAppData((prev) => ({
        ...prev,
        isDataLoaded: true,
      }))
    }, 500)
  }

  const refreshData = async (section?: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    if (section) {
      const endpoints: any = {
        dashboard: "https://api.yespstudio.com/api/admin/stats",
        products: "https://api.yespstudio.com/api/admin/products",
        orders: "https://api.yespstudio.com/api/admin/orders",
        customers: "https://api.yespstudio.com/api/admin/customers",
        categories: "https://api.yespstudio.com/api/admin/categories",
        offers: "https://api.yespstudio.com/api/admin/offers",
        payments: "https://api.yespstudio.com/api/admin/payments",
        storeInfo: "https://api.yespstudio.com/api/admin/store-info",
      }
      if (endpoints[section]) {
        setAppData((prev) => ({
          ...prev,
          loadingStates: {
            ...prev.loadingStates,
            [section]: true,
          },
        }))
        await fetchDataSection(token, section, endpoints[section])
      }
    } else {
      // Refresh all data
      setAppData((prev) => ({
        ...prev,
        loadingStates: Object.keys(prev.loadingStates).reduce(
          (acc, key) => ({
            ...acc,
            [key]: true,
          }),
          {},
        ),
      }))
      await loadAllData(token)
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Quick auth check
        const token = localStorage.getItem("token")
        if (!token) {
          setIsAuthChecking(false)
          router.push("/login")
          return
        }

        // Set authenticated and stop auth checking
        setIsAuthenticated(true)
        setIsAuthChecking(false)

        // Update refresh function
        setAppData((prev) => ({
          ...prev,
          refreshData,
        }))

        // Start loading data in background
        await loadAllData(token)
      } catch (error) {
        console.error("Failed to initialize app:", error)
        setIsAuthChecking(false)
        router.push("/login")
      }
    }
    initializeApp()
  }, [router])

  // Determine what to show in content area
  const getContentArea = () => {
    // If still checking authentication, show auth loading
    if (isAuthChecking) {
      return <AuthLoadingContent />
    }
    // If not authenticated, show auth loading (will redirect)
    if (!isAuthenticated) {
      return <AuthLoadingContent />
    }
    // If on dashboard and data not loaded, show skeleton
    if (pathname === "/dashboard" && !appData.isDataLoaded) {
      return <MainContentSkeleton />
    }
    // Show actual content
    return children
  }

  // Replace the existing SidebarProvider with controlled state
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <AppDataContext.Provider value={appData}>
      <SidebarProvider open={sidebarOpen} onOpenChange={() => setSidebarOpen(true)}>
        <div className="flex h-screen w-full bg-gray-50">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col min-w-0 relative rounded-xl">
            <HelpButton />
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-full h-full">{getContentArea()}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AppDataContext.Provider>
  )
}
