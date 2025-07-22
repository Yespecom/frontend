import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - 7)

    // Get comprehensive payment statistics
    const [todayStats, weekStats, monthStats, totalStats, methodBreakdown, statusBreakdown, recentPayments] =
      await Promise.all([
        // Today's stats
        db
          .collection("payments")
          .aggregate([
            {
              $match: {
                tenantId: decoded.tenantId,
                createdAt: { $gte: today },
              },
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
              },
            },
          ])
          .toArray(),

        // Week stats
        db
          .collection("payments")
          .aggregate([
            {
              $match: {
                tenantId: decoded.tenantId,
                createdAt: { $gte: startOfWeek },
              },
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
              },
            },
          ])
          .toArray(),

        // Month stats
        db
          .collection("payments")
          .aggregate([
            {
              $match: {
                tenantId: decoded.tenantId,
                createdAt: { $gte: startOfMonth },
              },
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
              },
            },
          ])
          .toArray(),

        // Total stats
        db
          .collection("payments")
          .aggregate([
            {
              $match: {
                tenantId: decoded.tenantId,
              },
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
              },
            },
          ])
          .toArray(),

        // Payment method breakdown
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
                _id: "$method",
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
              },
            },
          ])
          .toArray(),

        // Status breakdown
        db
          .collection("payments")
          .aggregate([
            {
              $match: {
                tenantId: decoded.tenantId,
              },
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),

        // Recent payments
        db
          .collection("payments")
          .find({
            tenantId: decoded.tenantId,
          })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray(),
      ])

    // Process the data
    const processStats = (stats: any[]) => {
      const result = {
        success: { count: 0, amount: 0 },
        failed: { count: 0, amount: 0 },
        pending: { count: 0, amount: 0 },
      }

      stats.forEach((stat) => {
        if (result[stat._id as keyof typeof result]) {
          result[stat._id as keyof typeof result] = {
            count: stat.count,
            amount: stat.amount,
          }
        }
      })

      return result
    }

    const summary = {
      today: processStats(todayStats),
      week: processStats(weekStats),
      month: processStats(monthStats),
      total: processStats(totalStats),
      todayRevenue: todayStats.find((s) => s._id === "success")?.amount || 0,
      monthRevenue: monthStats.find((s) => s._id === "success")?.amount || 0,
      totalRevenue: totalStats.find((s) => s._id === "success")?.amount || 0,
      methodBreakdown: methodBreakdown.map((method) => ({
        method: method._id,
        count: method.count,
        amount: method.amount,
      })),
      statusBreakdown: statusBreakdown.map((status) => ({
        status: status._id,
        count: status.count,
      })),
      recentPayments: recentPayments.map((payment) => ({
        _id: payment._id,
        paymentId: payment.paymentId || payment.razorpay_payment_id,
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt,
      })),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching payment summary:", error)
    return NextResponse.json({ error: "Failed to fetch payment summary" }, { status: 500 })
  }
}
