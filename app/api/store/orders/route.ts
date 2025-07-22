import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { getStoreFromHost } from "@/lib/store"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreFromHost(request.headers.get("host"))
    if (!storeId) {
      return NextResponse.json({ error: "Invalid store" }, { status: 400 })
    }

    const user = await verifyToken(request)
    if (!user || user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const db = await connectDB()
    const query: any = { customerId: new ObjectId(user.userId) }

    if (status) {
      query.status = status
    }

    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection("orders").countDocuments(query)

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get customer orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreFromHost(request.headers.get("host"))
    if (!storeId) {
      return NextResponse.json({ error: "Invalid store" }, { status: 400 })
    }

    const user = await verifyToken(request)
    if (!user || user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items, shippingAddress, paymentMethod, offerId } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 })
    }

    const db = await connectDB()

    // Get tenant
    const tenant = await db.collection("tenants").findOne({ storeId })
    if (!tenant) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Calculate total
    let total = 0
    const orderItems = []

    for (const item of items) {
      const product = await db.collection("products").findOne({
        _id: new ObjectId(item.productId),
        tenantId: tenant.userId,
      })

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      const itemTotal = product.price * item.quantity
      total += itemTotal

      orderItems.push({
        productId: new ObjectId(item.productId),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
      })
    }

    // Apply offer if provided
    if (offerId) {
      const offer = await db.collection("offers").findOne({
        _id: new ObjectId(offerId),
        tenantId: tenant.userId,
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
      })

      if (offer) {
        if (offer.type === "percentage") {
          total = total * (1 - offer.value / 100)
        } else if (offer.type === "fixed") {
          total = Math.max(0, total - offer.value)
        }
      }
    }

    // Create order
    const order = {
      tenantId: tenant.userId,
      customerId: new ObjectId(user.userId),
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("orders").insertOne(order)

    // Update product stock
    for (const item of items) {
      await db
        .collection("products")
        .updateOne({ _id: new ObjectId(item.productId) }, { $inc: { stock: -item.quantity } })
    }

    return NextResponse.json(
      {
        success: true,
        data: { ...order, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
