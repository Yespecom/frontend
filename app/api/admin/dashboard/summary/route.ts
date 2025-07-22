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

    // Get all summary statistics
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      todayOrders,
      monthRevenue,
      recentOrders,
      topProducts,
      orderStatusBreakdown,
    ] = await Promise.all([
      // Total orders
      db
        .collection("orders")
        .countDocuments({ tenantId: decoded.tenantId }),

      // Total products
      db
        .collection("products")
        .countDocuments({ tenantId: decoded.tenantId }),

      // Total customers
      db
        .collection("customers")
        .countDocuments({ tenantId: decoded.tenantId }),

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

      // Today's orders
      db
        .collection("orders")
        .countDocuments({
          tenantId: decoded.tenantId,
          createdAt: { $gte: today },
        }),

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

      // Recent orders
      db
        .collection("orders")
        .find({
          tenantId: decoded.tenantId,
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),

      // Top products
      db
        .collection("orders")
        .aggregate([
          {
            $match: { tenantId: decoded.tenantId },
          },
          {
            $unwind: "$items",
          },
          {
            $group: {
              _id: "$items.productId",
              totalSold: { $sum: "$items.quantity" },
              revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            },
          },
          {
            $sort: { totalSold: -1 },
          },
          {
            $limit: 5,
          },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "product",
            },
          },
        ])
        .toArray(),

      // Order status breakdown
      db
        .collection("orders")
        .aggregate([
          {
            $match: { tenantId: decoded.tenantId },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ])

    const summary = {
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayOrders,
      monthRevenue: monthRevenue[0]?.total || 0,
      recentOrders: recentOrders.map((order) => ({
        _id: order._id,
        orderId: order.orderId,
        customerName: order.customerInfo?.name || "Unknown",
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })),
      topProducts: topProducts.map((item) => ({
        productId: item._id,
        name: item.product[0]?.name || "Unknown Product",
        totalSold: item.totalSold,
        revenue: item.revenue,
      })),
      orderStatusBreakdown: orderStatusBreakdown.map((status) => ({
        status: status._id,
        count: status.count,
      })),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 })
  }
}
