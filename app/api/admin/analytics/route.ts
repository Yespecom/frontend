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

    // Get monthly revenue for the last 12 months
    const monthlyRevenue = await db
      .collection("payments")
      .aggregate([
        {
          $match: {
            tenantId: decoded.tenantId,
            status: "success",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ])
      .toArray()

    // Get top selling products
    const topProducts = await db
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
          $limit: 10,
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
      .toArray()

    return NextResponse.json({
      monthlyRevenue: monthlyRevenue.map((item) => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
        revenue: item.revenue,
        orders: item.orders,
      })),
      topProducts: topProducts.map((item) => ({
        productId: item._id,
        name: item.product[0]?.name || "Unknown Product",
        totalSold: item.totalSold,
        revenue: item.revenue,
      })),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
