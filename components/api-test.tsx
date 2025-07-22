"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.yespstudio.com"

export default function ApiTest() {
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const testCreateOffer = async () => {
    setLoading(true)
    setResponse("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setResponse("❌ No token found")
        return
      }

      const testOffer = {
        title: "Test Offer " + Date.now(),
        type: "percentage",
        value: 10,
        minOrderAmount: 100,
        maxDiscount: 50,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        usageLimit: 100,
      }

      console.log("🧪 Testing offer creation with:", testOffer)

      const response = await fetch(`${API_BASE_URL}/api/admin/offers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testOffer),
      })

      console.log("🧪 Response status:", response.status)
      console.log("🧪 Response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("🧪 Raw response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        data = responseText
      }

      setResponse(`Status: ${response.status}
Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}
Raw Response: ${responseText}
Parsed Data: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error("🧪 Test error:", error)
      setResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>API Test - Create Offer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testCreateOffer} disabled={loading}>
          {loading ? "Testing..." : "Test Create Offer API"}
        </Button>

        {response && (
          <div>
            <h4 className="font-medium mb-2">Response:</h4>
            <Textarea value={response} readOnly className="min-h-[300px] font-mono text-xs" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
