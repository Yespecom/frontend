import type { NextRequest } from "next/server"

export function getClientIP(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp
  // @ts-expect-error - NextRequest may have ip in some runtimes
  const reqIp: string | undefined = (req as any).ip
  return reqIp || "0.0.0.0"
}
