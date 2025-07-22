import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectDB()
    const payment = await db.collection("payments").findOne({
      _id: new ObjectId(params.id),
      tenantId: decoded.tenantId,
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Get related order information
    const order = await db.collection("orders").findOne({
      orderId: payment.orderId,
      tenantId: decoded.tenantId,
    })

    return NextResponse.json({
      ...payment,
      order: order || null,
    })
  } catch (error) {
    console.error("Error fetching payment:", error)
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { status, gatewayResponse } = body

    const db = await connectDB()

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) updateData.status = status
    if (gatewayResponse) updateData.gatewayResponse = gatewayResponse

    const result = await db.collection("payments").updateOne(
      {
        _id: new ObjectId(params.id),
        tenantId: decoded.tenantId,
      },
      { $set: updateData },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const updatedPayment = await db.collection("payments").findOne({
      _id: new ObjectId(params.id),
    })

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}
