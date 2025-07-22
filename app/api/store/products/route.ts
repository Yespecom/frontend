import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { getStoreFromHost } from "@/lib/store"

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreFromHost(request.headers.get("host"))
    if (!storeId) {
      return NextResponse.json({ error: "Invalid store" }, { status: 400 })
    }

    const db = await connectDB()

    // Get tenant by storeId
    const tenant = await db.collection("tenants").findOne({ storeId })
    if (!tenant) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const products = await db
      .collection("products")
      .find({
        tenantId: tenant.userId,
        isActive: true,
        stock: { $gt: 0 },
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Store products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
