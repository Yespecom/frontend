import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, otp, purpose } = await request.json()

    if (!email || !otp || !purpose) {
      return NextResponse.json({ error: "Email, OTP, and purpose are required" }, { status: 400 })
    }

    const db = await connectDB()

    // Find OTP record
    const otpRecord = await db.collection("otps").findOne({
      email,
      purpose,
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP expired or not found" }, { status: 400 })
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await db.collection("otps").deleteOne({ _id: otpRecord._id })
      return NextResponse.json({ error: "Too many attempts. Please request a new OTP" }, { status: 400 })
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await db.collection("otps").updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } })
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
