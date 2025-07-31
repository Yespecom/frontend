"use client"

import React from "react"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import {
  Eye,
  EyeOff,
  Store,
  Mail,
  User,
  Phone,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Check,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Types for better type safety
interface FormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

interface ApiResponse {
  token?: string
  tenantId?: string
  status?: string
  storeId?: string
  error?: string
  message?: string
  success?: boolean
  code?: string
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.yespstudio.com"

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "verify">("register")
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "+91 ",
    password: "",
    confirmPassword: "",
  })
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({})
  const [formProgress, setFormProgress] = useState(0)

  const router = useRouter()
  const { toast } = useToast()
  const otpInputRef = useRef<HTMLInputElement>(null)

  // Countdown timer for resend OTP
  const timer = React.useRef<NodeJS.Timeout | null>(null)
  React.useEffect(() => {
    if (countdown > 0) {
      timer.current = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [countdown])

  // Calculate form progress
  React.useEffect(() => {
    const fields = [formData.name, formData.email, formData.phone, formData.password, formData.confirmPassword]
    const filledFields = fields.filter((field) => field.trim() !== "").length
    const progress = (filledFields / fields.length) * 100
    setFormProgress(progress)
  }, [formData])

  // Enhanced validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return null
  }

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return "Phone number is required"

    // Remove all non-digits to check the actual number
    const cleanPhone = phone.replace(/\D/g, "")

    // Check if it starts with 91 (Indian country code)
    if (!cleanPhone.startsWith("91")) {
      return "Please enter a valid Indian phone number"
    }

    // Remove country code to check mobile number
    const mobileNumber = cleanPhone.substring(2)

    // Indian mobile numbers are 10 digits and start with 6, 7, 8, or 9
    if (mobileNumber.length !== 10) {
      return "Indian mobile number must be 10 digits"
    }

    if (!/^[6-9]/.test(mobileNumber)) {
      return "Indian mobile number must start with 6, 7, 8, or 9"
    }

    return null
  }

  const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 characters long"
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number"
    return null
  }

  const validateName = (name: string): string | null => {
    if (!name.trim()) return "Full name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters long"
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces"
    return null
  }

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return "Please confirm your password"
    if (password !== confirmPassword) return "Passwords do not match"
    return null
  }

  // Real-time validation
  const validateField = useCallback(
    (fieldName: keyof FormData, value: string) => {
      let error: string | null = null

      switch (fieldName) {
        case "name":
          error = validateName(value)
          break
        case "email":
          error = validateEmail(value)
          break
        case "phone":
          error = validatePhone(value)
          break
        case "password":
          error = validatePassword(value)
          break
        case "confirmPassword":
          error = validateConfirmPassword(formData.password, value)
          break
      }

      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }))

      return error === null
    },
    [formData.password],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target

      // Format phone number as user types
      let formattedValue = value
      if (name === "phone") {
        // Remove all non-digits
        const digits = value.replace(/\D/g, "")

        // Always start with +91 for Indian numbers
        if (digits.length === 0) {
          formattedValue = "+91 "
        } else if (digits.length <= 2) {
          // If user is typing the country code
          if (digits.startsWith("91")) {
            formattedValue = "+91 "
          } else {
            formattedValue = "+91 " + digits
          }
        } else {
          // Format as +91 XXXXX XXXXX
          const countryCode = digits.startsWith("91") ? digits.substring(0, 2) : "91"
          const number = digits.startsWith("91") ? digits.substring(2) : digits

          if (number.length <= 5) {
            formattedValue = `+${countryCode} ${number}`
          } else {
            formattedValue = `+${countryCode} ${number.substring(0, 5)} ${number.substring(5, 10)}`
          }
        }

        // Limit to Indian phone number length (+91 + 10 digits)
        if (digits.length > 12) {
          return // Don't update if too long
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }))

      // Validate field if it has been touched
      if (fieldTouched[name]) {
        validateField(name as keyof FormData, formattedValue)
      }
    },
    [fieldTouched, validateField],
  )

  const handleFieldBlur = useCallback(
    (fieldName: string, value: string) => {
      setFieldTouched((prev) => ({ ...prev, [fieldName]: true }))
      validateField(fieldName as keyof FormData, value)
    },
    [validateField],
  )

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    errors.name = validateName(formData.name)
    errors.email = validateEmail(formData.email)
    errors.phone = validatePhone(formData.phone)
    errors.password = validatePassword(formData.password)
    errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword)

    if (!acceptTerms) {
      errors.terms = "Please accept the terms and conditions to continue"
    }

    setValidationErrors(errors)

    // Check if any errors exist
    const hasErrors = Object.values(errors).some((error) => error !== null)
    return !hasErrors
  }

  const handleApiError = (response: Response, data: ApiResponse): string => {
    let errorMessage = "Something went wrong. Please try again."
    if (response.status === 400) {
      errorMessage = data.error || data.message || "Invalid request data."
    } else if (response.status === 401) {
      errorMessage = "Invalid or expired OTP. Please try again."
    } else if (response.status === 409) {
      errorMessage = "An account with this email already exists. Please try logging in instead."
    } else if (response.status === 422) {
      errorMessage = "Please check your information and try again."
    } else if (response.status === 500) {
      errorMessage = "Server error. Please try again later."
    }
    return errorMessage
  }

  // Enhanced OTP input handling
  const handleOtpChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const cleanValue = value.replace(/\D/g, "").slice(0, 6)
    setOtp(cleanValue)
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      return
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: "Please fix the errors below",
        description: "Check all fields and try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log("🚀 Sending OTP request to:", `${API_BASE_URL}/api/auth/register/initiate`)

      const response = await fetch(`${API_BASE_URL}/api/auth/register/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ""), // Send clean phone number
          password: formData.password,
        }),
      })

      const responseText = await response.text()
      let data: ApiResponse

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        if (responseText.includes("OTP") || response.status === 200) {
          toast({
            title: "✨ Verification code sent!",
            description: "Check your email for the 6-digit code.",
          })
          setStep("verify")
          setCountdown(60)
          setTimeout(() => otpInputRef.current?.focus(), 100)
          return
        }
        throw new Error("Invalid response from server")
      }

      const isSuccess =
        response.ok &&
        (data.success === true || data.success === "true" || response.status === 200 || response.status === 201)

      if (isSuccess) {
        toast({
          title: "✨ Verification code sent!",
          description: "Check your email for the 6-digit code.",
        })
        setStep("verify")
        setCountdown(60)
        setTimeout(() => otpInputRef.current?.focus(), 100)
      } else {
        const errorMessage = handleApiError(response, data)
        toast({
          title: "Failed to send verification code",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Send OTP error:", error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast({
        title: "Invalid verification code",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const requestPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ""), // Send clean phone number
        password: formData.password,
        otp: otp,
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      const responseText = await response.text()
      let data: ApiResponse

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        if (responseText.includes("success") || responseText.includes("token")) {
          toast({
            title: "🎉 Welcome to Yesp Ecom Studio!",
            description: "Your account has been created successfully.",
          })
          router.push("/setup-store")
          return
        }
        throw new Error("Invalid response from server")
      }

      if (data.code === "NO_PENDING_REGISTRATION" && data.error?.includes("No pending registration found")) {
        toast({
          title: "🎉 Welcome to Yesp Ecom Studio!",
          description: "Your account has been created successfully.",
        })
        localStorage.setItem("userName", formData.name)
        localStorage.setItem("userEmail", formData.email)
        router.push("/setup-store")
        return
      }

      const hasSuccessData = data.token || data.tenantId || data.message?.includes("success")
      const isSuccess =
        response.ok || response.status === 200 || response.status === 201 || data.success || hasSuccessData

      if (isSuccess) {
        if (data.token) localStorage.setItem("token", data.token)
        if (data.tenantId) localStorage.setItem("tenantId", data.tenantId)

        localStorage.setItem("userName", formData.name)
        localStorage.setItem("userEmail", formData.email)

        toast({
          title: "🎉 Welcome to Yesp Ecom Studio!",
          description: "Your account has been created successfully.",
        })
        router.push("/setup-store")
      } else {
        if (responseText.includes("verified successfully") || responseText.includes("OTP verified")) {
          toast({
            title: "🎉 Welcome to Yesp Ecom Studio!",
            description: "Your account has been created successfully.",
          })
          router.push("/setup-store")
          return
        }

        const errorMessage = handleApiError(response, data)
        toast({
          title: "Verification failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setResendLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          purpose: "registration",
        }),
      })
      const data: ApiResponse = await response.json()
      if (response.ok && data.success) {
        toast({
          title: "✨ New code sent!",
          description: "A fresh verification code has been sent to your email.",
        })
        setCountdown(60)
        setOtp("")
        otpInputRef.current?.focus()
      } else {
        toast({
          title: "Error",
          description: data.error || data.message || "Failed to resend code. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  // Helper component for input validation display
  const InputValidation = ({ error, success }: { error?: string; success?: boolean }) => {
    if (error) {
      return (
        <div className="flex items-center mt-1 text-red-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          <span className="text-xs">{error}</span>
        </div>
      )
    }
    if (success) {
      return (
        <div className="flex items-center mt-1 text-green-600">
          <Check className="w-3 h-3 mr-1" />
          <span className="text-xs">Looks good!</span>
        </div>
      )
    }
    return null
  }

  // Render verification step
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Brand Header */}
        <div className="w-full py-6 px-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=40&width=40&text=Logo"
                  alt="Yesp Ecom Studio Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">Yesp Ecom Studio</span>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs w-fit">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Beta Available
                </Badge>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-md">
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-gray-200">
              <CardHeader className="text-center pb-6 space-y-4">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-2xl font-bold text-slate-900">Verify Email</span>
                    <p className="text-sm text-slate-600 -mt-1">Almost there! 🎉</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-slate-900">Enter verification code</CardTitle>
                  <CardDescription className="text-slate-600">
                    We've sent a 6-digit code to <strong className="text-slate-900">{formData.email}</strong>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="otp" className="text-sm font-medium text-slate-700 text-center block">
                      Verification Code
                    </Label>
                    <div className="flex justify-center">
                      <Input
                        ref={otpInputRef}
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => handleOtpChange(e.target.value)}
                        onKeyDown={handleOtpKeyDown}
                        className="w-48 h-14 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg"
                        maxLength={6}
                        autoComplete="one-time-code"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-2">{otp.length}/6 digits entered</div>
                      <Progress value={(otp.length / 6) * 100} className="w-48 mx-auto h-1" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-600">Didn't receive the code?</p>
                  <Button
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || resendLoading}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    {resendLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin h-3 w-3 mr-2" />
                        Sending...
                      </div>
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Resend code
                      </div>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("register")}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    ← Back to registration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Render registration step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Brand Header */}
      <div className="w-full py-6 px-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=40&width=40&text=Logo"
                alt="Yesp Ecom Studio Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900">Yesp Ecom Studio</span>
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs w-fit">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta Available
              </Badge>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-gray-200">
            <CardHeader className="text-center pb-6 space-y-4">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-slate-900">Join Us</span>
                  <p className="text-sm text-slate-600 -mt-1">Create your account ✨</p>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-slate-900">Create your account</CardTitle>
                <CardDescription className="text-slate-600">
                  Start your ecommerce journey today and build your dream store
                </CardDescription>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Progress</span>
                  <span>{Math.round(formProgress)}% complete</span>
                </div>
                <Progress value={formProgress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSendOTP} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-slate-500" />
                    Full name *
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("name", e.target.value)}
                      required
                      className={`h-11 border-2 transition-all duration-200 ${
                        validationErrors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : fieldTouched.name && !validationErrors.name
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-300 focus:border-slate-500 focus:ring-slate-500/20"
                      } bg-white`}
                    />
                    {fieldTouched.name && !validationErrors.name && (
                      <Check className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <InputValidation
                    error={validationErrors.name}
                    success={fieldTouched.name && !validationErrors.name}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                    Email address *
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("email", e.target.value)}
                      required
                      className={`h-11 border-2 transition-all duration-200 ${
                        validationErrors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : fieldTouched.email && !validationErrors.email
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-300 focus:border-slate-500 focus:ring-slate-500/20"
                      } bg-white`}
                    />
                    {fieldTouched.email && !validationErrors.email && (
                      <Check className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <InputValidation
                    error={validationErrors.email}
                    success={fieldTouched.email && !validationErrors.email}
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-slate-500" />
                    Phone number *
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                      required
                      className={`h-11 border-2 transition-all duration-200 ${
                        validationErrors.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : fieldTouched.phone && !validationErrors.phone
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-300 focus:border-slate-500 focus:ring-slate-500/20"
                      } bg-white`}
                    />
                    {fieldTouched.phone && !validationErrors.phone && (
                      <Check className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <InputValidation
                    error={validationErrors.phone}
                    success={fieldTouched.phone && !validationErrors.phone}
                  />
                  <div className="text-xs text-slate-500">
                    🇮🇳 Indian mobile number (10 digits starting with 6, 7, 8, or 9)
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-slate-500" />
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("password", e.target.value)}
                      required
                      minLength={6}
                      className={`h-11 border-2 pr-11 transition-all duration-200 ${
                        validationErrors.password
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : fieldTouched.password && !validationErrors.password
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-300 focus:border-slate-500 focus:ring-slate-500/20"
                      } bg-white`}
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
                  <InputValidation
                    error={validationErrors.password}
                    success={fieldTouched.password && !validationErrors.password}
                  />
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Password must contain:</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div
                        className={`flex items-center ${formData.password.length >= 6 ? "text-green-600" : "text-slate-400"}`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full mr-2 ${formData.password.length >= 6 ? "bg-green-600" : "bg-slate-400"}`}
                        />
                        6+ characters
                      </div>
                      <div
                        className={`flex items-center ${/(?=.*[a-z])/.test(formData.password) ? "text-green-600" : "text-slate-400"}`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full mr-2 ${/(?=.*[a-z])/.test(formData.password) ? "bg-green-600" : "bg-slate-400"}`}
                        />
                        Lowercase
                      </div>
                      <div
                        className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? "text-green-600" : "text-slate-400"}`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full mr-2 ${/(?=.*[A-Z])/.test(formData.password) ? "bg-green-600" : "bg-slate-400"}`}
                        />
                        Uppercase
                      </div>
                      <div
                        className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? "text-green-600" : "text-slate-400"}`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full mr-2 ${/(?=.*\d)/.test(formData.password) ? "bg-green-600" : "bg-slate-400"}`}
                        />
                        Number
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-slate-500" />
                    Confirm password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("confirmPassword", e.target.value)}
                      required
                      className={`h-11 border-2 pr-11 transition-all duration-200 ${
                        validationErrors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : fieldTouched.confirmPassword && !validationErrors.confirmPassword
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-300 focus:border-slate-500 focus:ring-slate-500/20"
                      } bg-white`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  <InputValidation
                    error={validationErrors.confirmPassword}
                    success={fieldTouched.confirmPassword && !validationErrors.confirmPassword}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="mt-0.5 border-slate-400 data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
                    />
                    <Label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-slate-600 hover:text-slate-900 font-medium underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-slate-600 hover:text-slate-900 font-medium underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {validationErrors.terms && <InputValidation error={validationErrors.terms} />}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Sending Verification Code...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Code
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Features highlight */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">🚀 What you'll get:</p>
                    <p className="text-xs text-slate-600">
                      Free store setup • Payment processing • Analytics dashboard • 24/7 support
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                <div className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  SSL Secured
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  GDPR Compliant
                </div>
                <div className="flex items-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Data Protected
                </div>
              </div>
            </CardContent>

            <CardFooter className="text-center bg-gradient-to-r from-gray-50 to-slate-50 rounded-b-lg">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors underline"
                >
                  Sign in →
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
