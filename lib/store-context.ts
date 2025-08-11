import { connectDB } from "./db"

export async function getStoreContext(storeId: string): Promise<{ storeId: string; tenantId: string } | null> {
  const db = await connectDB()
  // Try to find by a few common fields
  const store =
    (await db.collection("stores").findOne({ storeId })) ||
    (await db.collection("stores").findOne({ slug: storeId })) ||
    (await db.collection("stores").findOne({ id: storeId }))

  if (!store) return null

  // Attempt to resolve tenantId from common fields
  const tenantId = store.tenantId || store.ownerTenantId || store.organizationId || store.orgId
  if (!tenantId) return null

  return { storeId: store.storeId || store.slug || store.id || storeId, tenantId }
}
