import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
}

interface FullPageLoaderProps {
  title?: string
  subtitle?: string
  progress?: number
}

interface ButtonLoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

interface InlineLoaderProps {
  text?: string
  className?: string
}

// Basic Loading Spinner
export function LoadingSpinner({ size = "md", text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <Loader2 className={cn("animate-spin text-gray-600", sizeClasses[size])} />
      {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
    </div>
  )
}

// Full Page Loader with Progress
export function FullPageLoader({ title = "Loading", subtitle, progress }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        {/* Loading Animation */}
        <div className="space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-gray-600 mx-auto" />

          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gray-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Loading Steps */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
            <span>Preparing your workspace...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Button Loading State
export function ButtonLoader({ size = "md", className }: ButtonLoaderProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
}

// Inline Loader for Content
export function InlineLoader({ text = "Loading...", className }: InlineLoaderProps) {
  return (
    <div className={cn("flex items-center space-x-2 text-gray-600", className)}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

// Skeleton Loader for Cards
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

// Data Loading with minimal design
export function DataLoader({ text = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  )
}

// Loading Dots Animation
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

// Minimal page transition loader
export function PageTransitionLoader({ isVisible = true }: { isVisible?: boolean }) {
  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-gray-600 animate-pulse"></div>
      </div>
    </div>
  )
}
