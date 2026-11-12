import crypto from "crypto";

export const VERIFY_TTL_MS = 10 * 60 * 1000; // 10 mins for OTP

// 6-digit cryptographic random numeric OTP
export const createOtp = () => {
  return String(crypto.randomInt(100000, 1000000));
};

// 32-byte url-safe token for link-based fallback
export const createVerificationToken = () =>
  crypto.randomBytes(32).toString("base64Url");

// Store only SHA-256 hash
export const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token).trim()).digest("hex");
