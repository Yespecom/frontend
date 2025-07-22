import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectDB()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const status = searchParams.get("status")
    const method = searchParams.get("method")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build filter query
    const filter: any = { tenantId: decoded.tenantId }
    if (status) filter.status = status
    if (method) filter.method = method

    // Get payments with pagination
    const payments = await db
      .collection("payments")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const total = await db.collection("payments").countDocuments(filter)

    // Calculate summary statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [todayRevenue, monthRevenue, totalRevenue] = await Promise.all([
      // Today's revenue
      db
        .collection("payments")
        .aggregate([
          {
            $match: {
              tenantId: decoded.tenantId,
              status: "success",
              createdAt: { $gte: today },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ])
        .toArray(),

      // This month's revenue
      db
        .collection("payments")
        .aggregate([
          {
            $match: {
              tenantId: decoded.tenantId,
              status: "success",
              createdAt: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ])
        .toArray(),

      // Total revenue
      db
        .collection("payments")
        .aggregate([
          {
            $match: {
              tenantId: decoded.tenantId,
              status: "success",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ])
        .toArray(),
    ])

    const summary = {
      todayRevenue: todayRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
    }

    return NextResponse.json({
      payments: payments.map((payment) => ({
        _id: payment._id,
        paymentId: payment.paymentId || payment.razorpay_payment_id,
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method || "card",
        status: payment.status,
        gatewayResponse: payment.gatewayResponse || {},
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      summary,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { orderId, amount, method, paymentId, gatewayResponse } = body

    const db = await connectDB()

    const payment = {
      tenantId: decoded.tenantId,
      orderId,
      amount,
      method: method || "card",
      paymentId,
      status: "pending",
      gatewayResponse: gatewayResponse || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("payments").insertOne(payment)

    return NextResponse.json(
      {
        _id: result.insertedId,
        ...payment,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
