import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"

// Mock OTP service - replace with actual SMS/Email service
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendOTP(email: string, otp: string, purpose: string) {
  // Mock implementation - replace with actual email/SMS service
  console.log(`Sending OTP ${otp} to ${email} for ${purpose}`)
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { email, purpose } = await request.json()

    if (!email || !purpose) {
      return NextResponse.json({ error: "Email and purpose are required" }, { status: 400 })
    }

    const validPurposes = ["registration", "login", "password-reset"]
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 })
    }

    const db = await connectDB()

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete existing OTPs for this email and purpose
    await db.collection("otps").deleteMany({ email, purpose })

    // Store OTP
    await db.collection("otps").insertOne({
      email,
      otp,
      purpose,
      createdAt: new Date(),
      expiresAt,
      attempts: 0,
    })

    // Send OTP
    await sendOTP(email, otp, purpose)

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresAt,
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
