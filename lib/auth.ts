import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface TokenPayload {
  userId: string
  email: string
  tenantId: string
  role?: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function generateCustomerToken(payload: {
  customerId: string
  email: string
  storeId: string
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" })
}

export function verifyCustomerToken(token: string): {
  customerId: string
  email: string
  storeId: string
} | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      customerId: string
      email: string
      storeId: string
    }
  } catch (error) {
    console.error("Customer token verification failed:", error)
    return null
  }
}
