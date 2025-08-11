import { connectDB } from "./db"

export type OTPRecord = {
  _id?: any
  storeId: string
  phone: string
  purpose: "login" | "registration"
  otp: string
  createdAt: Date
  expiresAt: Date
  attempts: number
  ip?: string
}

export async function saveOTP(record: OTPRecord) {
  const db = await connectDB()
  // Cleanup existing OTPs for this phone/purpose/store
  await db.collection("otps").deleteMany({
    storeId: record.storeId,
    phone: record.phone,
    purpose: record.purpose,
  })
  await db.collection("otps").insertOne(record)
}

export async function findValidOTP(storeId: string, phone: string, purpose: "login" | "registration") {
  const db = await connectDB()
  const now = new Date()
  return db.collection("otps").findOne({
    storeId,
    phone,
    purpose,
    expiresAt: { $gt: now },
  })
}

export async function incrementOTPAttempts(id: any) {
  const db = await connectDB()
  await db.collection("otps").updateOne({ _id: id }, { $inc: { attempts: 1 } })
}

export async function consumeOTP(id: any) {
  const db = await connectDB()
  await db.collection("otps").deleteOne({ _id: id })
}

export function generateSixDigitOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
