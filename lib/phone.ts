export function isE164(phone: string): boolean {
  // Basic E.164: +[1-9][0-9]{7,14}
  return /^\+[1-9]\d{7,14}$/.test(phone)
}

export function getNameFromPhone(phone: string): string {
  const last4 = phone.replace(/\D/g, "").slice(-4)
  return `Customer ${last4 || "User"}`
}
