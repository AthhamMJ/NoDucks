import VerificationToken from "../models/VerificationToken.js";
import { consume } from "./rateLimitService.js";
import {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail,
  sendVerificationEmail,
} from "./emailService.js";
import {
  createOtp,
  createVerificationToken,
  hashToken,
  VERIFY_TTL_MS,
} from "../utils/verificationToken.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Rate limiting check
const checkSendLimits = async (email, ip, purpose = "verify") => {
  const cooldown = await consume(
    `${purpose}:email:${email}:cooldown`,
    1,
    60 * 1000 // 1 minute cooldown between resends
  );
  if (!cooldown.allowed) {
    return {
      ok: false,
      reason: "cooldown",
      retryAfterSec: cooldown.retryAfterSec,
    };
  }

  const daily = await consume(`${purpose}:email:${email}:day`, 6, DAY_MS);
  if (!daily.allowed) {
    return {
      ok: false,
      reason: "daily_limit",
      retryAfterSec: daily.retryAfterSec,
    };
  }

  const perIp = await consume(`${purpose}:ip:${ip}`, 15, 60 * 60 * 1000);
  if (!perIp.allowed) {
    return {
      ok: false,
      reason: "ip_limit",
      retryAfterSec: perIp.retryAfterSec,
    };
  }

  return null;
};

/**
 * Generate & Send 6-digit Email Verification OTP
 */
export const sendVerificationOtp = async (email, ip) => {
  const normalizedEmail = email.toLowerCase().trim();
  const blocked = await checkSendLimits(normalizedEmail, ip, "verify_otp");
  if (blocked) return blocked;

  const otp = createOtp();

  // Invalidate previous verification tokens of this type for this email
  await VerificationToken.deleteMany({
    email: normalizedEmail,
    type: "email_verification",
  });

  await VerificationToken.create({
    email: normalizedEmail,
    tokenHash: hashToken(otp),
    type: "email_verification",
    expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
  });

  await sendVerificationOtpEmail(normalizedEmail, otp);
  return { ok: true };
};

/**
 * Generate & Send 6-digit Password Reset OTP
 */
export const sendPasswordResetOtp = async (email, ip) => {
  const normalizedEmail = email.toLowerCase().trim();
  const blocked = await checkSendLimits(normalizedEmail, ip, "reset_otp");
  if (blocked) return blocked;

  const otp = createOtp();

  // Invalidate previous reset tokens of this type for this email
  await VerificationToken.deleteMany({
    email: normalizedEmail,
    type: "password_reset",
  });

  await VerificationToken.create({
    email: normalizedEmail,
    tokenHash: hashToken(otp),
    type: "password_reset",
    expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
  });

  await sendPasswordResetOtpEmail(normalizedEmail, otp);
  return { ok: true };
};

/**
 * Atomically consume and verify an OTP
 * Returns the record if valid, otherwise null.
 */
export const consumeOtp = async (email, otp, type = "email_verification") => {
  if (!email || !otp) return null;
  const normalizedEmail = String(email).toLowerCase().trim();
  const hashed = hashToken(String(otp).trim());

  return await VerificationToken.findOneAndDelete({
    email: normalizedEmail,
    tokenHash: hashed,
    type,
    expiresAt: { $gt: new Date() },
  });
};

/**
 * Legacy Link verification support
 */
export const sendVerificationLink = async (email, ip) => {
  const normalizedEmail = email.toLowerCase().trim();
  const blocked = await checkSendLimits(normalizedEmail, ip, "verify_link");
  if (blocked) return blocked;

  const token = createVerificationToken();

  await VerificationToken.deleteMany({
    email: normalizedEmail,
    type: "email_verification",
  });

  await VerificationToken.create({
    email: normalizedEmail,
    tokenHash: hashToken(token),
    type: "email_verification",
    expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
  });

  const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  const link = `${frontendBase}/verify-email?token=${token}`;
  await sendVerificationEmail(normalizedEmail, link);

  return { ok: true };
};

export const consumeVerificationToken = async (token) => {
  if (!token || typeof token !== "string") return null;
  return await VerificationToken.findOneAndDelete({
    tokenHash: hashToken(token),
    type: "email_verification",
    expiresAt: { $gt: new Date() },
  });
};
