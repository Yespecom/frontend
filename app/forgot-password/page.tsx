"use client"

import type React from "react"
import type { ReactElement } from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Link from "next/link"
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Shield, Lock, Eye, EyeOff, Check, X } from "lucide-react"

type Step = "email" | "verify" | "reset" | "success"

interface ApiResponse {
  message?: string
  error?: string
  success?: boolean
}

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
  label: string
}

export default function ForgotPasswordPage(): ReactElement {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")
  const [fieldError, setFieldError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "bg-gray-200",
    label: "Enter password",
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [countdown])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const validateEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }, [])

  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        feedback: [],
        color: "bg-gray-200",
        label: "Enter password",
      }
    }

    let score = 0
    const feedback: string[] = []

    // Length check
    if (password.length >= 8) {
      score += 20
    } else {
      feedback.push("At least 8 characters")
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 20
    } else {
      feedback.push("One uppercase letter")
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 20
    } else {
      feedback.push("One lowercase letter")
    }

    // Number check
    if (/\d/.test(password)) {
      score += 20
    } else {
      feedback.push("One number")
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20
    } else {
      feedback.push("One special character")
    }

    // Determine color and label based on score
    let color = "bg-red-500"
    let label = "Very Weak"

    if (score >= 80) {
      color = "bg-green-500"
      label = "Very Strong"
    } else if (score >= 60) {
      color = "bg-yellow-500"
      label = "Strong"
    } else if (score >= 40) {
      color = "bg-orange-500"
      label = "Fair"
    } else if (score >= 20) {
      color = "bg-red-400"
      label = "Weak"
    }

    return {
      score,
      feedback,
      color,
      label,
    }
  }, [])

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword))
    }
  }, [newPassword, calculatePasswordStrength])

  const logSecurityEvent = useCallback(
    async (event: string, details: object) => {
      try {
        // Log security events for monitoring
        console.log(`🔒 Security Event: ${event}`, {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          email: email || "unknown",
          step,
          ...details,
        })

        // In production, you might want to send this to a logging service
        // await fetch('/api/security/log', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     event,
        //     timestamp: new Date().toISOString(),
        //     userAgent: navigator.userAgent,
        //     email: email || 'unknown',
        //     step,
        //     ...details
        //   })
        // })
      } catch (error) {
        console.error("Failed to log security event:", error)
      }
    },
    [email, step],
  )

  const handleApiError = useCallback(
    (response: Response, data: ApiResponse): string => {
      let errorMessage = ""

      switch (response.status) {
        case 400:
          errorMessage = data.error || data.message || "Invalid request. Please check your input."
          break
        case 401:
          errorMessage = "Invalid or expired verification code."
          break
        case 404:
          errorMessage = "Email address not found. Please check and try again."
          break
        case 429:
          errorMessage = "Too many requests. Please wait a moment before trying again."
          break
        case 500:
          errorMessage = "Server error. Our team has been notified. Please try again later."
          break
        case 503:
          errorMessage = "Service temporarily unavailable. Please try again in a few minutes."
          break
        default:
          errorMessage = data.error || data.message || "Something went wrong. Please try again."
      }

      // Log the error for security monitoring
      logSecurityEvent("password_reset_error", {
        status: response.status,
        error: errorMessage,
        originalError: data.error || data.message,
      })

      return errorMessage
    },
    [logSecurityEvent],
  )

  const makeApiRequest = useCallback(
    async (url: string, body: object): Promise<{ success: boolean; data?: ApiResponse; error?: string }> => {
      try {
        console.log(`🔄 Making API request to: ${url}`, body)

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })

        const data: ApiResponse = await response.json()
        console.log(`📡 API response:`, { status: response.status, data })

        if (response.ok) {
          return { success: true, data }
        } else {
          const errorMessage = handleApiError(response, data)
          return { success: false, error: errorMessage }
        }
      } catch (error) {
        console.error("💥 API request failed:", error)

        logSecurityEvent("password_reset_network_error", {
          url,
          error: error instanceof Error ? error.message : "Unknown error",
        })

        if (error instanceof TypeError && error.message.includes("fetch")) {
          return {
            success: false,
            error: "Network error. Please check your internet connection and try again.",
          }
        }
        return {
          success: false,
          error: "Unable to connect to the server. Please try again later.",
        }
      }
    },
    [handleApiError, logSecurityEvent],
  )

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldError("")

    if (!email.trim()) {
      setFieldError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setFieldError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    // Log password reset attempt
    await logSecurityEvent("password_reset_requested", {
      email: email.trim(),
    })

    // Use the existing backend API endpoint
    const result = await makeApiRequest("/api/auth/forgot-password", {
      email: email.trim(),
    })

    if (result.success) {
      setStep("verify")
      setCountdown(60)
      await logSecurityEvent("password_reset_otp_sent", {
        email: email.trim(),
      })
    } else {
      setError(result.error || "Failed to send OTP. Please try again.")
      await logSecurityEvent("password_reset_otp_failed", {
        email: email.trim(),
        error: result.error,
      })
    }

    setIsLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.")
      return
    }

    setIsLoading(true)

    await logSecurityEvent("password_reset_otp_verification_attempted", {
      email: email.trim(),
      otpLength: otp.length,
    })

    // Use the existing backend API endpoint
    const result = await makeApiRequest("/api/auth/verify-reset-otp", {
      email: email.trim(),
      otp: otp,
    })

    if (result.success) {
      setStep("reset")
      await logSecurityEvent("password_reset_otp_verified", {
        email: email.trim(),
      })
    } else {
      setError(result.error || "Invalid or expired OTP. Please try again.")
      await logSecurityEvent("password_reset_otp_verification_failed", {
        email: email.trim(),
        error: result.error,
      })
    }

    setIsLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    if (passwordStrength.score < 40) {
      setError("Please choose a stronger password. Follow the suggestions below.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    await logSecurityEvent("password_reset_attempted", {
      email: email.trim(),
      passwordStrength: passwordStrength.score,
    })

    // Use the existing backend API endpoint
    const result = await makeApiRequest("/api/auth/reset-password", {
      email: email.trim(),
      otp: otp,
      newPassword: newPassword,
    })

    if (result.success) {
      setStep("success")
      await logSecurityEvent("password_reset_completed", {
        email: email.trim(),
      })
    } else {
      setError(result.error || "Failed to reset password. Please try again.")
      await logSecurityEvent("password_reset_failed", {
        email: email.trim(),
        error: result.error,
      })
    }

    setIsLoading(false)
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    setResendLoading(true)
    setError("")

    await logSecurityEvent("password_reset_otp_resend_requested", {
      email: email.trim(),
    })

    // Use the existing backend API endpoint
    const result = await makeApiRequest("/api/auth/forgot-password", {
      email: email.trim(),
    })

    if (result.success) {
      setCountdown(60)
      setOtp("")
      await logSecurityEvent("password_reset_otp_resent", {
        email: email.trim(),
      })
    } else {
      setError(result.error || "Failed to resend OTP. Please try again.")
      await logSecurityEvent("password_reset_otp_resend_failed", {
        email: email.trim(),
        error: result.error,
      })
    }

    setResendLoading(false)
  }

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value)
      if (fieldError) {
        setFieldError("")
      }
    },
    [fieldError],
  )

  const getStepTitle = (): string => {
    switch (step) {
      case "email":
        return "Reset your password"
      case "verify":
        return "Verify your email"
      case "reset":
        return "Create new password"
      case "success":
        return "Password reset successful"
      default:
        return "Reset your password"
    }
  }

  const getStepDescription = (): string => {
    switch (step) {
      case "email":
        return "Enter your email address and we'll send you a verification code"
      case "verify":
        return "Enter the 6-digit code we sent to your email"
      case "reset":
        return "Create a new secure password for your account"
      case "success":
        return "Your password has been successfully reset"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="Yesp Ecom Studio Logo" width={48} height={48} className="w-12 h-12" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">Yesp Ecom Studio</span>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs w-fit">Password Reset</Badge>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-88px)] px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>
          </div>

          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-lg">
              {step === "success" ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : step === "reset" ? (
                <Lock className="w-8 h-8 text-white" />
              ) : (
                <Shield className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{getStepTitle()}</h1>
              <p className="text-slate-600 mt-2">{getStepDescription()}</p>
            </div>
          </div>

          {/* Reset Form */}
          <Card className="border border-gray-200 shadow-lg">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-slate-900">
                {step === "email" && "Forgot Password"}
                {step === "verify" && "Enter Verification Code"}
                {step === "reset" && "New Password"}
                {step === "success" && "All Done!"}
              </CardTitle>
              <CardDescription className="text-center text-slate-600">
                {step === "email" && "We'll send you a verification code to reset your password"}
                {step === "verify" && `We've sent a 6-digit code to ${email}`}
                {step === "reset" && "Your new password must be at least 6 characters long"}
                {step === "success" && "You can now sign in with your new password"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Message */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Email Input */}
              {step === "email" && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        className={`pl-10 h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500 ${
                          fieldError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                        placeholder="Enter your email address"
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                    {fieldError && <p className="text-sm text-red-600">{fieldError}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Sending Code...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Send Verification Code</span>
                      </div>
                    )}
                  </Button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === "verify" && (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 text-center block">Verification Code</label>
                    <div className="flex justify-center">
                      <InputOTP value={otp} onChange={(value) => setOtp(value)} maxLength={6}>
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="w-12 h-12 text-lg border-gray-300 focus:border-slate-500"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify Code</span>
                      </div>
                    )}
                  </Button>
                  <div className="text-center space-y-3">
                    <p className="text-sm text-slate-600">Didn't receive the code?</p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={countdown > 0 || resendLoading}
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      {resendLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-600 border-t-transparent"></div>
                          <span>Sending...</span>
                        </div>
                      ) : countdown > 0 ? (
                        `Resend in ${countdown}s`
                      ) : (
                        "Resend code"
                      )}
                    </Button>
                  </div>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("email")}
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      ← Change email address
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                        placeholder="Enter new password (min 6 characters)"
                        disabled={isLoading}
                        minLength={6}
                        required
                        autoComplete="new-password"
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

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">Password Strength</span>
                          <span
                            className={`text-xs font-medium ${
                              passwordStrength.score >= 80
                                ? "text-green-600"
                                : passwordStrength.score >= 60
                                  ? "text-yellow-600"
                                  : passwordStrength.score >= 40
                                    ? "text-orange-600"
                                    : "text-red-600"
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <Progress value={passwordStrength.score} className="h-2" />
                        {passwordStrength.feedback.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600">Missing requirements:</p>
                            <ul className="space-y-1">
                              {passwordStrength.feedback.map((item, index) => (
                                <li key={index} className="flex items-center text-xs text-slate-600">
                                  <X className="w-3 h-3 text-red-500 mr-2" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {passwordStrength.score >= 80 && (
                          <div className="flex items-center text-xs text-green-600">
                            <Check className="w-3 h-3 mr-2" />
                            Strong password! All requirements met.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                        placeholder="Confirm your new password"
                        disabled={isLoading}
                        required
                        autoComplete="new-password"
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
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-600 flex items-center">
                        <X className="w-3 h-3 mr-1" />
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                      <p className="text-xs text-green-600 flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium text-slate-700">Password Requirements:</h4>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li className="flex items-center">
                        {newPassword.length >= 8 ? (
                          <Check className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                          <X className="w-3 h-3 text-red-500 mr-2" />
                        )}
                        At least 8 characters long
                      </li>
                      <li className="flex items-center">
                        {/[A-Z]/.test(newPassword) ? (
                          <Check className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                          <X className="w-3 h-3 text-red-500 mr-2" />
                        )}
                        One uppercase letter (A-Z)
                      </li>
                      <li className="flex items-center">
                        {/[a-z]/.test(newPassword) ? (
                          <Check className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                          <X className="w-3 h-3 text-red-500 mr-2" />
                        )}
                        One lowercase letter (a-z)
                      </li>
                      <li className="flex items-center">
                        {/\d/.test(newPassword) ? (
                          <Check className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                          <X className="w-3 h-3 text-red-500 mr-2" />
                        )}
                        One number (0-9)
                      </li>
                      <li className="flex items-center">
                        {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                          <Check className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                          <X className="w-3 h-3 text-red-500 mr-2" />
                        )}
                        One special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading || passwordStrength.score < 40 || newPassword !== confirmPassword}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Resetting Password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Reset Password</span>
                      </div>
                    )}
                  </Button>
                </form>
              )}

              {/* Step 4: Success */}
              {step === "success" && (
                <div className="text-center space-y-6">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Your password has been successfully reset!
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-4">
                    <p className="text-slate-600">You can now sign in with your new password.</p>
                    <Link href="/login">
                      <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                        Sign In Now
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {step !== "success" && (
                <>
                  <Separator className="my-6" />
                  {/* Navigation Links */}
                  <div className="text-center space-y-3">
                    <p className="text-slate-600">
                      Remember your password?{" "}
                      <Link
                        href="/login"
                        className="text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
                    <p className="text-slate-600">
                      Don't have an account?{" "}
                      <Link
                        href="/register"
                        className="text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                      >
                        Create your store
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-6 text-sm text-slate-500">
              <Link href="/terms" className="hover:text-slate-700 transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-slate-700 transition-colors">
                Privacy Policy
              </Link>
            </div>
            <p className="text-xs text-slate-400">© 2025 Yesp Ecom Studio. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
