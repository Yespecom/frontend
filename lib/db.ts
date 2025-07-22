import { MongoClient, type Db } from "mongodb"

let client: MongoClient
let db: Db

export async function connectDB(): Promise<Db> {
  if (db) {
    return db
  }

  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce"
    client = new MongoClient(uri)
    await client.connect()
    db = client.db()
    console.log("Connected to MongoDB")
    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export async function closeDB() {
  if (client) {
    await client.close()
  }
}
