import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, otp } = await request.json()

    if (!name || !email || !phone || !password || !otp) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await connectDB()

    // Verify OTP
    const otpRecord = await db.collection("otps").findOne({
      email,
      otp,
      purpose: "registration",
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = {
      name,
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
      isActive: true,
      role: "admin",
    }

    const result = await db.collection("users").insertOne(user)

    // Create tenant/store
    const tenant = {
      userId: result.insertedId,
      storeId: `store_${result.insertedId}`,
      createdAt: new Date(),
      isActive: true,
    }

    await db.collection("tenants").insertOne(tenant)

    // Generate JWT token
    const token = jwt.sign({ userId: result.insertedId, email, role: "admin" }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    })

    // Delete used OTP
    await db.collection("otps").deleteOne({ _id: otpRecord._id })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        phone,
      },
      tenant: {
        storeId: tenant.storeId,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
