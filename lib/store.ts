export function getStoreFromHost(host: string | null): string | null {
  if (!host) return null

  // Extract store ID from subdomain
  // Format: {storeId}.localhost:5000 or {storeId}.yourdomain.com
  const parts = host.split(".")
  if (parts.length >= 2) {
    return parts[0]
  }

  return null
}

export function getStoreUrl(storeId: string): string {
  const baseUrl = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_DOMAIN : "localhost:5000"

  return `https://${storeId}.${baseUrl}`
}
