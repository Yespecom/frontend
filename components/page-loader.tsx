"use client"

import { Loader2 } from "lucide-react"

interface PageLoaderProps {
  title?: string
  description?: string
  icon?: string
}

export function PageLoader({
  title = "Loading",
  description = "Please wait while we load your content...",

}: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md mx-auto">
        {/* Animated Icon */}
        <div className="text-6xl animate-bounce">{icon}</div>

        {/* Loading Spinner */}
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-semibold text-gray-800">{title}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-center text-sm leading-relaxed">{description}</p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}

// Skeleton loader for content
export function ContentSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Table skeleton loader
export function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex space-x-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Table rows */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-100 last:border-b-0">
          <div className="flex space-x-4">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
