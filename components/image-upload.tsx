"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Upload, ImageIcon, Loader2, AlertCircle, CheckCircle, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
  maxFileSize?: number // in MB
  allowedTypes?: string[]
}

interface UploadProgress {
  [key: string]: number
}

// Configuration for backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.yespstudio.com"

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  className,
  maxFileSize = 5, // 5MB default
  allowedTypes = [".jpeg", ".jpg", ".png", ".webp"],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
  const [failedUploads, setFailedUploads] = useState<string[]>([])
  const { toast } = useToast()

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!allowedTypes.includes(fileExtension)) {
      return `File type not supported. Allowed types: ${allowedTypes.join(", ")}`
    }

    return null
  }

  // Enhanced upload function with better error handling
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("image", file)
    const token = localStorage.getItem("token")

    console.log("🚀 Starting upload for:", file.name)
    console.log("📋 Upload URL:", `${BACKEND_URL}/api/admin/products/upload-image`)
    console.log("🔑 Has token:", !!token)
    console.log("📦 File size:", file.size, "bytes")
    console.log("📦 File type:", file.type)

    if (!token) {
      throw new Error("No authentication token found. Please log in again.")
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response statusText:", response.statusText)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      // Get response text first to see what we're actually getting
      const responseText = await response.text()
      console.log("📡 Raw response text:", responseText)
      console.log("📡 Response text length:", responseText.length)

      // Handle empty response
      if (!responseText || responseText.trim() === "") {
        console.error("❌ Empty response from server")
        throw new Error(`Server returned empty response. Status: ${response.status} ${response.statusText}`)
      }

      // Try to parse JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("📡 Parsed response data:", data)
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError)
        console.error("❌ Response was not valid JSON:", responseText)

        // If it's an HTML error page, extract useful info
        if (responseText.includes("<html>") || responseText.includes("<!DOCTYPE")) {
          throw new Error(
            `Server returned HTML instead of JSON. This usually means there's a server error or the endpoint doesn't exist.`,
          )
        }

        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 200)}...`)
      }

      // Check if response was successful
      if (!response.ok) {
        console.error("❌ Upload failed with status:", response.status)
        console.error("❌ Error data:", data)

        // Handle different types of error responses
        let errorMessage = `Upload failed with status: ${response.status}`

        if (data && typeof data === "object") {
          if (data.error) {
            errorMessage = data.error
          } else if (data.message) {
            errorMessage = data.message
          } else if (data.details) {
            errorMessage = data.details
          }
        }

        // Add specific error messages for common status codes
        switch (response.status) {
          case 401:
            errorMessage = "Authentication failed. Please log in again."
            localStorage.removeItem("token") // Clear invalid token
            break
          case 413:
            errorMessage = "File too large. Please choose a smaller image."
            break
          case 415:
            errorMessage = "Unsupported file type. Please use JPEG, PNG, or WebP."
            break
          case 500:
            errorMessage = "Server error. Please try again later."
            break
          case 502:
          case 503:
            errorMessage = "Server temporarily unavailable. Please try again."
            break
        }

        throw new Error(errorMessage)
      }

      // Validate response structure
      if (!data || typeof data !== "object") {
        console.error("❌ Invalid response structure:", data)
        throw new Error("Invalid response format from server")
      }

      if (!data.success) {
        console.error("❌ Server reported failure:", data)
        throw new Error(data.error || data.message || "Server reported upload failure")
      }

      if (!data.imageUrl) {
        console.error("❌ No image URL in response:", data)
        throw new Error("No image URL returned from server")
      }

      console.log("✅ Upload successful:", data.imageUrl)
      return data.imageUrl
    } catch (error) {
      console.error("❌ Upload error:", error)

      // Clean up progress on error
      setUploadProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[file.name]
        return newProgress
      })

      // Re-throw with better error message
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to upload image: Unknown error")
    }
  }

  // Enhanced delete function
  const deleteImage = async (imageUrl: string) => {
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("No authentication token found. Please log in again.")
    }

    console.log("🗑️ Deleting image:", imageUrl)

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products/delete-image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl }),
      })

      const responseText = await response.text()
      console.log("🗑️ Delete response:", responseText)

      if (!response.ok) {
        let errorData
        try {
          errorData = responseText ? JSON.parse(responseText) : {}
        } catch {
          errorData = { error: "Delete failed" }
        }
        throw new Error(errorData.error || "Failed to delete image")
      }

      console.log("✅ Image deleted successfully")
    } catch (error) {
      console.error("❌ Delete error:", error)
      throw error
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      console.log("📁 Files dropped:", acceptedFiles.length, "accepted,", rejectedFiles.length, "rejected")

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map(
          ({ file, errors }) => `${file.name}: ${errors.map((e: any) => e.message).join(", ")}`,
        )
        toast({
          title: "Some files were rejected",
          description: errors.join("\n"),
          variant: "destructive",
        })
      }

      // Check total images limit
      if (images.length + acceptedFiles.length > maxImages) {
        toast({
          title: "Too many images",
          description: `You can only upload up to ${maxImages} images. Current: ${images.length}, Trying to add: ${acceptedFiles.length}`,
          variant: "destructive",
        })
        return
      }

      // Validate each file
      const validFiles: File[] = []
      const invalidFiles: string[] = []

      for (const file of acceptedFiles) {
        const error = validateFile(file)
        if (error) {
          invalidFiles.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      }

      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid files",
          description: invalidFiles.join("\n"),
          variant: "destructive",
        })
      }

      if (validFiles.length === 0) return

      setUploading(true)
      setFailedUploads([])

      try {
        console.log("🚀 Starting upload process for", validFiles.length, "files")

        // Upload files sequentially to avoid overwhelming the server
        const successfulUploads: string[] = []
        const failedFiles: string[] = []

        for (const file of validFiles) {
          try {
            // Set initial progress
            setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

            // Simulate progress for better UX (since fetch doesn't support progress tracking)
            const progressInterval = setInterval(() => {
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: Math.min((prev[file.name] || 0) + 10, 90),
              }))
            }, 200)

            const imageUrl = await uploadImage(file)

            clearInterval(progressInterval)
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))

            successfulUploads.push(imageUrl)

            // Clean up progress after a short delay
            setTimeout(() => {
              setUploadProgress((prev) => {
                const newProgress = { ...prev }
                delete newProgress[file.name]
                return newProgress
              })
            }, 1000)
          } catch (error) {
            console.error(`❌ Failed to upload ${file.name}:`, error)
            failedFiles.push(file.name)
            setFailedUploads((prev) => [...prev, file.name])
          }
        }

        if (successfulUploads.length > 0) {
          onImagesChange([...images, ...successfulUploads])
          toast({
            title: "Upload completed",
            description: `${successfulUploads.length} image(s) uploaded successfully.${
              failedFiles.length > 0 ? ` ${failedFiles.length} failed.` : ""
            }`,
            variant: successfulUploads.length === validFiles.length ? "default" : "destructive",
          })
        } else {
          toast({
            title: "Upload failed",
            description: "All uploads failed. Please check your connection and try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("❌ Upload process error:", error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload images. Please try again.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        // Clear any remaining progress
        setTimeout(() => setUploadProgress({}), 2000)
      }
    },
    [images, maxImages, onImagesChange, toast, maxFileSize, allowedTypes],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": allowedTypes,
    },
    multiple: true,
    disabled: uploading || images.length >= maxImages,
    maxSize: maxFileSize * 1024 * 1024,
  })

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index]
    console.log("🗑️ Removing image at index:", index, "URL:", imageUrl)

    try {
      await deleteImage(imageUrl)
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      toast({
        title: "Image removed",
        description: "Image deleted successfully.",
      })
    } catch (error) {
      console.error("❌ Delete error:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]

    // Remove dragged image
    newImages.splice(draggedIndex, 1)

    // Insert at new position
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newImages.splice(adjustedDropIndex, 0, draggedImage)

    onImagesChange(newImages)
    setDraggedIndex(null)

    toast({
      title: "Images reordered",
      description: "Image order updated successfully.",
    })
  }

  const handleSetPrimary = (index: number) => {
    if (index === 0) return // Already primary

    const newImages = [...images]
    const primaryImage = newImages[index]

    // Remove from current position
    newImages.splice(index, 1)
    // Add to beginning
    newImages.unshift(primaryImage)

    onImagesChange(newImages)
    toast({
      title: "Primary image updated",
      description: "Primary image has been changed.",
    })
  }

  // Helper function to ensure image URL is accessible
  const getAccessibleImageUrl = (imageUrl: string) => {
    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http")) {
      return imageUrl
    }
    // If it's a relative path, prepend the backend URL
    if (imageUrl.startsWith("/uploads/")) {
      return `${BACKEND_URL}${imageUrl}`
    }
    // Fallback
    return imageUrl
  }

  const retryFailedUploads = () => {
    setFailedUploads([])
    toast({
      title: "Retry functionality",
      description: "Please try uploading the failed images again.",
    })
  }

  // Enhanced test connection function
  const testConnection = async () => {
    const token = localStorage.getItem("token")
    console.log("🧪 Testing connection to:", `${BACKEND_URL}/api/admin/products/test-connection`)
    console.log("🧪 Token available:", !!token)

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products/test-connection`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("🧪 Test response status:", response.status)
      console.log("🧪 Test response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("���� Test raw response:", responseText)

      let data
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch (e) {
        console.error("🧪 Test response not JSON:", responseText)
        data = { error: "Invalid JSON response", raw: responseText }
      }

      console.log("🧪 Test parsed data:", data)

      toast({
        title: response.ok ? "Connection successful" : "Connection failed",
        description: data.message || `Status: ${response.status}. Check console for details.`,
        variant: response.ok ? "default" : "destructive",
      })

      // Also test the upload endpoint specifically
      if (response.ok) {
        console.log("🧪 Testing upload endpoint availability...")
        const uploadTestResponse = await fetch(`${BACKEND_URL}/api/admin/products/upload-image`, {
          method: "OPTIONS", // Just check if endpoint exists
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("🧪 Upload endpoint test:", uploadTestResponse.status)
      }
    } catch (error) {
      console.error("🧪 Connection test failed:", error)
      toast({
        title: "Connection test failed",
        description: error instanceof Error ? error.message : "Unknown error. Check console.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Debug Info</p>
                <p className="text-xs text-yellow-600">Backend URL: {BACKEND_URL}</p>
                <p className="text-xs text-yellow-600">Has Token: {!!localStorage.getItem("token")}</p>
              </div>
              <Button variant="outline" size="sm" onClick={testConnection}>
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : uploading
              ? "border-orange-400 bg-orange-50"
              : "border-gray-300 hover:border-blue-400"
        }`}
      >
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-colors ${
              isDragActive ? "text-blue-600" : "text-gray-500"
            } ${uploading || images.length >= maxImages ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-3">
              {uploading ? (
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              ) : (
                <Upload className="h-12 w-12" />
              )}

              <div>
                <p className="text-lg font-medium">
                  {uploading ? "Uploading images..." : isDragActive ? "Drop images here" : "Drag & drop images here"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {!uploading && !isDragActive && "or click to browse files"}
                </p>
              </div>

              {!uploading && (
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>
                    {allowedTypes.join(", ").toUpperCase()} up to {maxFileSize}MB
                  </span>
                  <span>•</span>
                  <span>
                    {images.length}/{maxImages} images
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading Files
            </h4>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="truncate">{fileName}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Uploads */}
      {failedUploads.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">Failed Uploads</p>
                  <p className="text-xs text-red-600">{failedUploads.join(", ")}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={retryFailedUploads}
                className="text-red-600 border-red-300 hover:bg-red-100 bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card
              key={index}
              className={`relative group overflow-hidden cursor-move transition-transform hover:scale-105 ${
                draggedIndex === index ? "opacity-50 scale-95" : ""
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={getAccessibleImageUrl(imageUrl) || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=200"
                      console.error("Failed to load image:", imageUrl)
                    }}
                    crossOrigin="anonymous"
                  />

                  {/* Primary Badge */}
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs">Primary</Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index !== 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                        onClick={() => handleSetPrimary(index)}
                        title="Set as primary image"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRemoveImage(index)}
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Drag Indicator */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">Drag to reorder</div>
                  </div>

                  {/* Image Index */}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No images uploaded yet</p>
          <p className="text-sm">Upload some product images to get started</p>
          <p className="text-xs mt-2">
            Supported formats: {allowedTypes.join(", ").toUpperCase()} • Max size: {maxFileSize}MB each
          </p>
        </div>
      )}

      {/* Upload Tips */}
      {images.length > 0 && images.length < maxImages && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <ImageIcon className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Image Tips:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• The first image will be used as the main product image</li>
                  <li>• Drag and drop to reorder images</li>
                  <li>• Use high-quality images for better customer experience</li>
                  <li>
                    • You can upload {maxImages - images.length} more image{maxImages - images.length !== 1 ? "s" : ""}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
