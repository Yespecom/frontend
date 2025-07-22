"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Store, Mail, Lock, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Sending login request with data:", {
        email: formData.email,
        password: formData.password,
      })

      const response = await fetch("https://api.yespstudio.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok) {
        // Store authentication data - handle different possible response structures
        if (data.token) {
          localStorage.setItem("token", data.token)
        }

        // Handle different possible user data structures
        const user = data.user || data
        if (user.tenantId) {
          localStorage.setItem("tenantId", user.tenantId)
        } else if (data.tenantId) {
          localStorage.setItem("tenantId", data.tenantId)
        }

        if (user.id) {
          localStorage.setItem("userId", user.id)
        } else if (data.id) {
          localStorage.setItem("userId", data.id)
        }

        if (user.name) {
          localStorage.setItem("userName", user.name)
        } else if (data.name) {
          localStorage.setItem("userName", data.name)
        }

        if (user.email) {
          localStorage.setItem("userEmail", user.email)
        } else if (data.email) {
          localStorage.setItem("userEmail", data.email)
        }

        // Check if user already has a store
        const hasStore = user.hasStore || data.hasStore || false
        localStorage.setItem("hasStore", hasStore.toString())

        if (hasStore) {
          const storeId = user.storeId || data.storeId
          if (storeId) {
            localStorage.setItem("storeId", storeId)
          }
          toast({
            title: "Welcome back!",
            description: "Login successful. Redirecting to your dashboard.",
          })
          router.push("/dashboard")
        } else {
          toast({
            title: "Welcome!",
            description: "Login successful. Let's set up your store.",
          })
          router.push("/setup-store")
        }
      } else {
        // Handle specific error messages from backend
        let errorMessage = "Invalid credentials. Please try again."
        if (response.status === 400) {
          errorMessage = data.message || data.error || "Invalid input data."
        } else if (response.status === 401) {
          errorMessage = data.message || data.error || "Invalid email or password."
        } else if (response.status === 404) {
          errorMessage = data.message || data.error || "Account not found."
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later."
        }

        console.error("Login failed:", errorMessage)
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check if the backend is running on localhost:5000.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Brand Header */}
      <div className="w-full py-6 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image src="/logo.png" alt="Yesp Ecom Studio Logo" width={40} height={40} className="w-10 h-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900">Yesp Ecom Studio</span>
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs w-fit">Beta Available</Badge>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-xl border border-gray-200">
            <CardHeader className="text-center pb-6 space-y-4">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-slate-900">Welcome Back</span>
                  <p className="text-sm text-slate-600 -mt-1">Sign in to continue</p>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-slate-900">Sign in to your account</CardTitle>
                <CardDescription className="text-slate-600">
                  Enter your credentials to access your dashboard
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 bg-white transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-slate-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 bg-white pr-11 transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link
                      href="/forgot-password"
                      className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sign in
                    </div>
                  )}
                </Button>
              </form>

              {/* Features highlight */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Ready to grow your business?</p>
                    <p className="text-xs text-slate-600">Access powerful tools to manage your online store</p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="text-center bg-gray-50 rounded-b-lg">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  Sign up for free
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
