import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const products = await db
      .collection("products")
      .find({ tenantId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const stock = Number.parseInt(formData.get("stock") as string)
    const images = formData.getAll("images") as File[]

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 })
    }

    // Handle image uploads (mock implementation)
    const imageUrls: string[] = []
    for (const image of images) {
      if (image instanceof File) {
        // Mock image upload - replace with actual cloud storage
        const imageUrl = `/uploads/${Date.now()}-${image.name}`
        imageUrls.push(imageUrl)
      }
    }

    const db = await connectDB()
    const product = {
      tenantId: new ObjectId(user.userId),
      name,
      description,
      price,
      category,
      stock: stock || 0,
      images: imageUrls,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
    }

    const result = await db.collection("products").insertOne(product)

    return NextResponse.json(
      {
        success: true,
        data: { ...product, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
