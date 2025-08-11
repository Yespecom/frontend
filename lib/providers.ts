export function getTwilioEnv() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  const fromNumber = process.env.TWILIO_FROM_NUMBER
  return {
    accountSid,
    authToken,
    verifyServiceSid,
    messagingServiceSid,
    fromNumber,
    isVerifyConfigured: Boolean(accountSid && authToken && verifyServiceSid),
    isSmsConfigured: Boolean(accountSid && authToken && (messagingServiceSid || fromNumber)),
  }
}

export function getFast2SmsEnv() {
  const apiKey = process.env.FAST2SMS_API_KEY
  const senderId = process.env.FAST2SMS_SENDER_ID
  return {
    apiKey,
    senderId,
    isConfigured: Boolean(apiKey),
  }
}

export function isProduction() {
  return process.env.NODE_ENV === "production"
}
