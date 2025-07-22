"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Store, CheckCircle2, AlertCircle, Building2, Tag } from "lucide-react"

export default function SetupStorePage() {
  const [formData, setFormData] = useState({
    storeName: "",
    industry: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const hasStore = localStorage.getItem("hasStore")
    if (!token) {
      router.push("/login")
    } else if (hasStore === "true") {
      router.push("/dashboard")
    }
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required"
    } else if (formData.storeName.length < 2) {
      newErrors.storeName = "Store name must be at least 2 characters"
    } else if (formData.storeName.length > 50) {
      newErrors.storeName = "Store name must be less than 50 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSetupStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      const storeData = {
        storeName: formData.storeName,
        industry: formData.industry,
      }

      const response = await fetch("https://api.yespstudio.com/api/auth/setup-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("storeId", data.storeId)
        localStorage.setItem("hasStore", "true")
        toast({
          title: "Store created successfully",
          description: `Your store is now available at ${data.storeUrl}`,
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Setup failed",
          description: data.error || "Failed to create store",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating your store",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const getCompletionStatus = () => {
    const required = formData.storeName.trim() !== ""
    const optional = formData.industry ? 1 : 0
    return { required, optional, total: optional + (required ? 1 : 0) }
  }

  const completion = getCompletionStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg mb-4">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create Your Store</h1>
          <p className="text-gray-600">Set up your eCommerce store in a few simple steps</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Setup Progress</span>
            <span className="text-sm text-gray-500">{completion.total}/2 completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completion.total / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Form */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">Store Information</CardTitle>
            <CardDescription>
              Provide basic information about your store. Required fields are marked with an asterisk.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSetupStore} className="space-y-6">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Store Name *
                </Label>
                <Input
                  id="storeName"
                  name="storeName"
                  type="text"
                  placeholder="Enter your store name"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className={`h-10 ${errors.storeName ? "border-red-300 focus:border-red-500" : ""}`}
                  required
                />
                {errors.storeName && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.storeName}
                  </div>
                )}
                {formData.storeName && !errors.storeName && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-gray-500">
                      Store URL:{" "}
                      <code className="bg-gray-100 px-1 rounded text-gray-700">
                        {formData.storeName.toLowerCase().replace(/\s+/g, "-")}.store
                      </code>
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Industry
                  {formData.industry && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </Label>
                <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select your industry (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="Electronics">Electronics & Technology</SelectItem>
                    <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                    <SelectItem value="Sports">Sports & Recreation</SelectItem>
                    <SelectItem value="Books">Books & Media</SelectItem>
                    <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                    <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Help us customize your store experience by selecting your industry
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                  disabled={loading || !completion.required}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Store...
                    </div>
                  ) : (
                    "Create Store"
                  )}
                </Button>
                {!completion.required && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Please fill in the required fields to continue
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">Need assistance? Contact our support team for help with store setup.</p>
        </div>
      </div>
    </div>
  )
}
