"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  CreditCard,
  Gift,
  User,
  LogOut,
  ChevronDown,
  Store,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface UserData {
  name: string
  email: string
  phone: string
  role: string
  hasStore: boolean
  storeInfo?: {
    name: string
    logo: string
    banner: string
    storeId: string
    industry: string
    isActive: boolean
  }
}

interface StoreData {
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
  createdAt: string
  updatedAt: string
}

interface StoreStats {
  products: number
  orders: number
  customers: number
  pendingOrders?: number
  totalRevenue?: number
}

type LoadingState = "idle" | "loading" | "success" | "error"

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>("loading")
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  // Modern Logo Component with Custom Image
  function YespLogo() {
    return (
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="relative">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg bg-white overflow-hidden border border-slate-600">
            <Image
              src="/logo.png?height=48&width=48"
              alt="Yesp Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain sm:w-12 sm:h-12"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">Yesp</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">Ecom Studio</p>
        </div>
      </div>
    )
  }

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    fetchUserAndStoreData()
  }, [])

  // Retry mechanism with exponential backoff
  const retryFetch = useCallback(() => {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
    setTimeout(() => {
      setRetryCount((prev) => prev + 1)
      fetchUserAndStoreData()
    }, delay)
  }, [retryCount])

  const fetchUserAndStoreData = async () => {
    if (!isOnline) {
      setError("No internet connection")
      setLoadingState("error")
      return
    }

    setLoadingState("loading")
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      // Fetch user status and basic store info
      const userResponse = await fetch("https://api.yespstudio.com/api/auth/user/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserData(userData.user)

        // Store the storeId and tenantId for future use
        if (userData.storeId) {
          localStorage.setItem("storeId", userData.storeId)
        }
        if (userData.tenantId) {
          localStorage.setItem("tenantId", userData.tenantId)
        }
      } else {
        throw new Error("Failed to fetch user data")
      }

      // Fetch store data and stats in parallel for better performance
      const [storeResponse, statsResponse] = await Promise.all([
        fetch("https://api.yespstudio.com/api/admin/store-info", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://api.yespstudio.com/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        setStoreData(storeData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStoreStats(statsData)
      }

      setLoadingState("success")
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Failed to load data")
      setLoadingState("error")
      handleAuthError()
    }
  }

  const handleAuthError = () => {
    // Use fallback data from localStorage if available
    const userName = localStorage.getItem("userName")
    const userEmail = localStorage.getItem("userEmail")
    const storeId = localStorage.getItem("storeId")

    if (userName && userEmail) {
      setUserData({
        name: userName,
        email: userEmail,
        phone: "+1 (555) 123-4567",
        role: "Owner",
        hasStore: !!storeId,
        storeInfo: storeId
          ? {
              name: "My Store",
              logo: "",
              banner: "",
              storeId: storeId,
              industry: "General",
              isActive: true,
            }
          : undefined,
      })

      if (storeId) {
        setStoreData({
          storeId: storeId,
          storeName: "My Store",
          logo: "",
          banner: "",
          industry: "General",
          isActive: true,
          storeUrl: `http://${storeId.toLowerCase()}.localhost:5000`,
          adminUrl: "https://api.yespstudio.com/api/admin",
          owner: {
            name: userName,
            email: userEmail,
            phone: "+1 (555) 123-4567",
            role: "Owner",
          },
          general: {},
          social: {},
          shipping: {},
          tenantId: localStorage.getItem("tenantId") || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
      setLoadingState("success")
    } else {
      router.push("/login")
    }
  }

  const handleLogout = () => {
    // Clear all localStorage items
    const itemsToRemove = ["token", "tenantId", "storeId", "hasStore", "userId", "userName", "userEmail"]
    itemsToRemove.forEach((item) => localStorage.removeItem(item))
    router.push("/login")
  }

  // Close mobile sidebar when navigating
  const handleNavigation = () => {
    setOpenMobile(false)
  }

  // Static navigation items - always visible
  const navigation = [
    {
      title: "Yesp Web Studio",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Orders",
          href: "/orders",
          icon: ShoppingCart,
          
        },
        {
          name: "Products",
          href: "/products",
          icon: Package,
          // badge: storeStats?.products > 0 ? storeStats.products.toString() : undefined,
        },
        {
          name: "Customers",
          href: "/customers",
          icon: Users,
          // badge: storeStats?.customers > 0 ? storeStats.customers.toString() : undefined,
        },
        {
          name: "Offers",
          href: "/offers",
          icon: Gift,
        },
        {
          name: "Categories",
          href: "/categories",
          icon: Tag,
        },
        {
          name: "Store Settings",
          href: "/settings",
          icon: Store,
        },
        {
          name: "Payments",
          href: "/payments",
          icon: CreditCard,
        },
      ],
    },
  ]

  // Store status skeleton - minimal loading state
  const StoreStatusSkeleton = () => (
    <div className="mb-4 p-3 sm:p-4 bg-slate-800 rounded-xl border border-slate-600">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-24 bg-slate-600" />
          <Skeleton className="h-3 w-16 bg-slate-700" />
          <Skeleton className="h-3 w-20 bg-slate-700" />
        </div>
        <Skeleton className="h-6 w-12 bg-slate-600" />
      </div>
    </div>
  )

  // User menu skeleton - minimal loading state
  const UserMenuSkeleton = () => (
    <div className="w-full h-12 sm:h-12 px-3 sm:px-4 rounded-xl border border-slate-600 bg-slate-800">
      <div className="flex items-center space-x-3 h-full">
        <Skeleton className="w-8 h-8 rounded-full bg-slate-600" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-20 bg-slate-600" />
          <Skeleton className="h-2 w-32 bg-slate-700" />
        </div>
        <Skeleton className="w-4 h-4 bg-slate-600" />
      </div>
    </div>
  )

  return (
    <Sidebar className="bg-slate-900 border-r border-slate-700" collapsible="none" variant="sidebar">
      <SidebarHeader className="border-b border-slate-700 px-4 sm:px-6 py-4 sm:py-6 bg-slate-900">
        <YespLogo />
        <div className="flex items-center gap-2 mt-2 sm:mt-3">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs font-medium">BETA</Badge>
          {!isOnline && (
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs font-medium">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 sm:px-4 py-3 sm:py-4 bg-slate-900">
        {/* Error State */}
        {loadingState === "error" && (
          <div className="mb-4">
            <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">{error || "Failed to load data"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={retryFetch}
                  className="h-6 px-2 text-red-300 hover:text-red-200 hover:bg-red-500/20"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Navigation - Always visible */}
        {navigation.map((section) => (
          <SidebarGroup key={section.title} className="mb-4">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700 data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-lg h-10 sm:h-9 px-3 rounded-lg"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center justify-between w-full"
                        onClick={handleNavigation}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        {/* Show badge if available, or skeleton if loading */}
                        
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-700 p-3 sm:p-4 bg-slate-900">
        {/* Store Status Card */}
        {loadingState === "loading" ? (
          <StoreStatusSkeleton />
        ) : (
          storeData && (
            <div className="mb-4 p-3 sm:p-4 bg-slate-800 rounded-xl border border-slate-600 hover:bg-slate-750">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{storeData.storeName}</p>
                  <p className="text-xs text-slate-300 truncate">ID: {storeData.storeId}</p>
                  {storeData.industry && <p className="text-xs text-slate-400 truncate">{storeData.industry}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {isOnline && <Wifi className="w-3 h-3 text-green-400" />}
                  <Badge
                    className={
                      storeData.isActive
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                    }
                  >
                    {storeData.isActive ? "Live" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          )
        )}

        {/* User Menu */}
        <SidebarMenu>
          <SidebarMenuItem>
            {loadingState === "loading" ? (
              <UserMenuSkeleton />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between text-slate-300 hover:text-white hover:bg-slate-700 h-12 px-3 sm:px-4 rounded-xl border border-slate-600 bg-slate-800 shadow-sm">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">{userData?.name || "Account"}</div>
                        <div className="text-xs text-slate-400 truncate">{userData?.email || "user@example.com"}</div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 bg-slate-800 border-slate-600">
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-white">{userData?.name || "User"}</p>
                      <p className="text-xs text-slate-400">{userData?.email || "user@example.com"}</p>
                      {userData?.role && (
                        <Badge className="w-fit text-xs bg-slate-700 text-slate-300 border-slate-600">
                          {userData.role}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-600" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="px-3 py-2 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-md focus:bg-red-500/20"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
