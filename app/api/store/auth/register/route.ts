import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import { getStoreFromHost } from "@/lib/store"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreFromHost(request.headers.get("host"))
    if (!storeId) {
      return NextResponse.json({ error: "Invalid store" }, { status: 400 })
    }

    const { name, email, password, phone } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    const db = await connectDB()

    // Get tenant
    const tenant = await db.collection("tenants").findOne({ storeId })
    if (!tenant) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Check if customer already exists
    const existingCustomer = await db.collection("customers").findOne({
      email,
      tenantId: tenant.userId,
    })

    if (existingCustomer) {
      return NextResponse.json({ error: "Customer already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create customer
    const customer = {
      tenantId: tenant.userId,
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      addresses: [],
      createdAt: new Date(),
      isActive: true,
    }

    const result = await db.collection("customers").insertOne(customer)

    // Generate token
    const token = generateToken({
      customerId: result.insertedId,
      email,
      storeId,
      role: "customer",
    })

    return NextResponse.json(
      {
        success: true,
        token,
        customer: {
          id: result.insertedId,
          name,
          email,
          phone,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Customer registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
