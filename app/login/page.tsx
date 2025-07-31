"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Eye,
  EyeOff,
  Store,
  Mail,
  Lock,
  CheckCircle,
  Trophy,
  Zap,
  Users,
  TrendingUp,
  Star,
  Clock,
  Gift,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  .animate-shake {
    animation: shake 0.6s ease-in-out;
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginProgress, setLoginProgress] = useState(0)
  const [formValidation, setFormValidation] = useState({
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" },
  })
  const [currentFeature, setCurrentFeature] = useState(0)
  const [loginStreak, setLoginStreak] = useState(0)
  const [lastLoginTime, setLastLoginTime] = useState<string | null>(null)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  // Add this after the state declarations
  const testNotifications = () => {
    console.log("🧪 Testing notification system...")

    // Test toast
    toast({
      title: "🧪 Test Notification",
      description: "This is a test notification to verify the system works",
      variant: "destructive",
    })

    // Test field errors
    setFieldErrors({
      email: "Test email error",
      password: "Test password error",
    })

    // Test shake animation
    triggerShakeAnimation()

    // Test error message
    setErrorMessage("Test error message for debugging")

    console.log("🧪 All test notifications triggered")
  }

  const features = [
    {
      icon: <Store className="w-5 h-5 text-blue-600" />,
      title: "Multi-Store Management",
      description: "Manage multiple stores from one dashboard",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      title: "Real-time Analytics",
      description: "Track sales and performance instantly",
    },
    {
      icon: <Users className="w-5 h-5 text-purple-600" />,
      title: "Customer Insights",
      description: "Understand your customers better",
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      title: "Automated Marketing",
      description: "Boost sales with smart automation",
    },
  ]

  // Load user engagement data on component mount
  useEffect(() => {
    const streak = localStorage.getItem("loginStreak")
    const lastLogin = localStorage.getItem("lastLoginTime")
    const userEmail = localStorage.getItem("userEmail")
    const attempts = localStorage.getItem("loginAttempts")

    if (streak) setLoginStreak(Number.parseInt(streak))
    if (lastLogin) {
      setLastLoginTime(lastLogin)
      if (userEmail) setShowWelcomeBack(true)
    }
    if (attempts) setLoginAttempts(Number.parseInt(attempts))
  }, [])

  // Feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Real-time form validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return { isValid: false, message: "" }
    } else if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" }
    }
    return { isValid: true, message: "Looks good!" }
  }

  const validatePassword = (password: string) => {
    if (!password) {
      return { isValid: false, message: "" }
    } else if (password.length < 6) {
      return { isValid: false, message: "Password must be at least 6 characters" }
    }
    return { isValid: true, message: "Strong password!" }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Real-time validation
    if (name === "email") {
      setFormValidation((prev) => ({
        ...prev,
        email: validateEmail(value),
      }))
    } else if (name === "password") {
      setFormValidation((prev) => ({
        ...prev,
        password: validatePassword(value),
      }))
    }
  }

  const updateLoginStreak = () => {
    const today = new Date().toDateString()
    const lastLoginDate = localStorage.getItem("lastLoginDate")

    if (lastLoginDate === today) {
      // Already logged in today
      return
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (lastLoginDate === yesterday.toDateString()) {
      // Consecutive day login
      const newStreak = loginStreak + 1
      setLoginStreak(newStreak)
      localStorage.setItem("loginStreak", newStreak.toString())

      // Show achievement for milestones
      if (newStreak === 7) {
        toast({
          title: "🔥 Week Warrior!",
          description: "7 days login streak! You're on fire!",
        })
      } else if (newStreak === 30) {
        toast({
          title: "🏆 Monthly Master!",
          description: "30 days login streak! Incredible dedication!",
        })
      }
    } else {
      // Reset streak
      setLoginStreak(1)
      localStorage.setItem("loginStreak", "1")
    }

    localStorage.setItem("lastLoginDate", today)
    localStorage.setItem("lastLoginTime", new Date().toLocaleString())
  }

  const triggerShakeAnimation = () => {
    setShowError(true)
    setTimeout(() => setShowError(false), 600)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginProgress(0)
    setFieldErrors({ email: "", password: "" })
    setErrorMessage("")

    // Animated progress
    const progressInterval = setInterval(() => {
      setLoginProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      console.log("🚀 Sending login request with data:", {
        email: formData.email,
        password: "***hidden***", // Don't log actual password
        timestamp: new Date().toISOString(),
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

      setLoginProgress(100)
      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log("📦 Response data:", data)

      if (response.ok) {
        console.log("✅ Login successful!")
        // Reset login attempts on success
        setLoginAttempts(0)
        localStorage.removeItem("loginAttempts")

        // Update login streak
        updateLoginStreak()

        // Store authentication data
        if (data.token) {
          localStorage.setItem("token", data.token)
        }

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

        const hasStore = user.hasStore || data.hasStore || false
        localStorage.setItem("hasStore", hasStore.toString())

        if (hasStore) {
          const storeId = user.storeId || data.storeId
          if (storeId) {
            localStorage.setItem("storeId", storeId)
          }
          toast({
            title: "🎉 Welcome back!",
            description: `Login successful! ${loginStreak > 1 ? `${loginStreak} day streak!` : ""}`,
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
        // Enhanced error logging
        console.error("❌ Login failed with status:", response.status)
        console.error("❌ Error response data:", data)

        // Increment login attempts
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        localStorage.setItem("loginAttempts", newAttempts.toString())

        console.log("🔢 Login attempt count:", newAttempts)

        // Trigger shake animation
        triggerShakeAnimation()
        console.log("🔄 Triggered shake animation")

        let errorMessage = "Invalid credentials. Please try again."
        let specificFieldError = ""

        // Enhanced error handling with detailed logging
        if (response.status === 400) {
          console.log("🔍 400 Bad Request - Invalid input data")
          errorMessage = data.message || data.error || "Invalid input data."
          if (data.field === "email") {
            specificFieldError = "email"
            setFieldErrors((prev) => ({ ...prev, email: "Please check your email address" }))
            console.log("📧 Email field error set")
          } else if (data.field === "password") {
            specificFieldError = "password"
            setFieldErrors((prev) => ({ ...prev, password: "Please check your password" }))
            console.log("🔒 Password field error set")
          }
        } else if (response.status === 401) {
          console.log("🔍 401 Unauthorized - Invalid credentials")
          errorMessage = data.message || data.error || "Invalid email or password."
          // Set both fields as potentially incorrect
          setFieldErrors({
            email: "Please verify your email address",
            password: "Please verify your password",
          })
          console.log("🔐 Both email and password field errors set")
        } else if (response.status === 404) {
          console.log("🔍 404 Not Found - Account not found")
          errorMessage = data.message || data.error || "Account not found with this email address."
          setFieldErrors((prev) => ({ ...prev, email: "No account found with this email" }))
          console.log("👤 Email field error set - account not found")
        } else if (response.status === 500) {
          console.log("🔍 500 Server Error")
          errorMessage = "Server error. Please try again later."
        }

        setErrorMessage(errorMessage)
        console.log("💬 Error message set:", errorMessage)
        console.error("🚨 Final error message:", errorMessage)

        // Enhanced toast notification based on attempt count
        if (newAttempts >= 3) {
          console.log("⚠️ Multiple failed attempts detected:", newAttempts)
          toast({
            title: "🚨 Multiple Failed Attempts",
            description: `${errorMessage} (Attempt ${newAttempts}/5)`,
            variant: "destructive",
          })
          console.log("🍞 Toast shown for multiple attempts")
        } else {
          console.log("🔔 Showing standard error toast")
          toast({
            title: "❌ Login Failed",
            description: errorMessage,
            variant: "destructive",
          })
          console.log("🍞 Standard error toast shown")
        }

        // Show warning for too many attempts
        if (newAttempts >= 5) {
          console.log("🚫 Too many attempts - showing security warning")
          toast({
            title: "⚠️ Account Security",
            description: "Too many failed attempts. Please wait before trying again or reset your password.",
            variant: "destructive",
          })
          console.log("🍞 Security warning toast shown")
        }
      }
    } catch (error) {
      console.error("🔥 Network/Connection error:", error)
      console.error("🔥 Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })

      triggerShakeAnimation()
      console.log("🔄 Triggered shake animation for network error")

      setErrorMessage("Unable to connect to the server. Please check your connection.")
      console.log("💬 Network error message set")

      toast({
        title: "🔌 Connection Error",
        description: "Unable to connect to the server. Please check if the backend is running on localhost:5000.",
        variant: "destructive",
      })
      console.log("🍞 Network error toast shown")
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
      setLoginProgress(0)
      console.log("🏁 Login process completed, loading state reset")
    }
  }

  const getLastLoginMessage = () => {
    if (!lastLoginTime) return null

    const lastLogin = new Date(lastLoginTime)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Welcome back! You were here less than an hour ago"
    if (diffInHours < 24) return `Welcome back! Last seen ${diffInHours} hours ago`
    if (diffInHours < 168) return `Welcome back! Last seen ${Math.floor(diffInHours / 24)} days ago`
    return "Welcome back! It's been a while"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <style jsx>{shakeKeyframes}</style>
      {/* Brand Header */}
      <div className="w-full py-6 px-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Yesp Ecom Studio Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900">Yesp Ecom Studio</span>
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs w-fit animate-pulse">
                <Gift className="w-3 h-3 mr-1" />
                Beta Available
              </Badge>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md">
          <Card
            className={`bg-white/95 backdrop-blur-sm shadow-2xl border border-gray-200 transition-all duration-300 hover:shadow-3xl ${showError ? "animate-shake" : ""}`}
          >
            <CardHeader className="text-center pb-6 space-y-4">
              {/* Welcome Back Message */}
              {showWelcomeBack && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-800">{getLastLoginMessage()}</p>
                  </div>
                </div>
              )}

              {/* Login Streak */}
              {loginStreak > 1 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 animate-bounce-in">
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-800">{loginStreak} Day Streak! 🔥</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
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
              {/* Progress Bar */}
              {isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Signing you in...</span>
                    <span className="text-slate-600">{loginProgress}%</span>
                  </div>
                  <Progress value={loginProgress} className="h-2" />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Add this button temporarily in the form for testing (remove after debugging) */}
                <Button
                  type="button"
                  onClick={testNotifications}
                  variant="outline"
                  className="w-full mb-4 bg-transparent"
                >
                  🧪 Test Notifications (Debug Only)
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                    Email address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`h-11 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 bg-white transition-all duration-200 ${
                        fieldErrors.email
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : formValidation.email.isValid
                            ? "border-green-300 focus:border-green-500"
                            : formData.email && !formValidation.email.isValid
                              ? "border-red-300 focus:border-red-500"
                              : ""
                      }`}
                    />
                    {formData.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {formValidation.email.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-red-300" />
                        )}
                      </div>
                    )}
                  </div>
                  {(formData.email && formValidation.email.message) || fieldErrors.email ? (
                    <p
                      className={`text-xs ${
                        fieldErrors.email
                          ? "text-red-600 font-medium"
                          : formValidation.email.isValid
                            ? "text-green-600"
                            : "text-red-600"
                      }`}
                    >
                      {fieldErrors.email || formValidation.email.message}
                    </p>
                  ) : null}
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
                      className={`h-11 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 bg-white pr-20 transition-all duration-200 ${
                        fieldErrors.password
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : formValidation.password.isValid
                            ? "border-green-300 focus:border-green-500"
                            : formData.password && !formValidation.password.isValid
                              ? "border-red-300 focus:border-red-500"
                              : ""
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      {formData.password &&
                        (formValidation.password.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-red-300" />
                        ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
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
                  {(formData.password && formValidation.password.message) || fieldErrors.password ? (
                    <p
                      className={`text-xs ${
                        fieldErrors.password
                          ? "text-red-600 font-medium"
                          : formValidation.password.isValid
                            ? "text-green-600"
                            : "text-red-600"
                      }`}
                    >
                      {fieldErrors.password || formValidation.password.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link
                      href="/forgot-password"
                      className="text-slate-600 hover:text-slate-900 font-medium transition-colors hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                  disabled={isLoading || !formValidation.email.isValid || !formValidation.password.isValid}
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

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800">Login Failed</p>
                      <p className="text-xs text-red-600">{errorMessage}</p>
                      {loginAttempts >= 3 && (
                        <p className="text-xs text-red-500 mt-1">
                          Attempt {loginAttempts}/5 - Consider{" "}
                          <Link href="/forgot-password" className="underline font-medium">
                            resetting your password
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Features Showcase */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200 transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="transition-all duration-300">{features[currentFeature].icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 transition-all duration-300">
                      {features[currentFeature].title}
                    </p>
                    <p className="text-xs text-slate-600 transition-all duration-300">
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>

                {/* Feature indicators */}
                <div className="flex justify-center space-x-1 mt-3">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentFeature ? "bg-slate-600" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Social Proof */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Trusted by <span className="font-semibold text-slate-900">10,000+</span> businesses worldwide
                </p>
              </div>
            </CardContent>

            <CardFooter className="text-center bg-gray-50 rounded-b-lg">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors hover:underline"
                >
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
