import VerificationToken from "../models/VerificationToken.js";
import { consume } from "./rateLimitService.js";
import { sendVerificationEmail } from "./emailService.js";
import {
  createVerificationToken,
  hashToken,
  VERIFY_TTL_MS,
} from "../utils/verificationToken.js";

const DAILY_EMAIL_BUDGET = 90; // Resend free tier is 100/day; keep a buffer
const DAY_MS = 24 * 60 * 60 * 1000;

// Returns null if allowed, or an object describing the block
const checkSendLimits = async (email, ip) => {
  const cooldown = await consume(
    `verify:email:${email}:cooldown`,
    1,
    60 * 1000,
  );
  if (!cooldown.allowed)
    return {
      ok: false,
      reason: "cooldown",
      retryAfterSec: cooldown.retryAfterSec,
    };

  const daily = await consume(`verify:email:${email}:day`, 5, DAY_MS);
  if (!daily.allowed)
    return {
      ok: false,
      reason: "daily_limit",
      retryAfterSec: daily.retryAfterSec,
    };

  const perIp = await consume(`verify:ip:${ip}`, 10, 60 * 60 * 1000);
  if (!perIp.allowed)
    return {
      ok: false,
      reason: "ip_limit",
      retryAfterSec: perIp.retryAfterSec,
    };

  // Global budget last, so blocked requests don't spend the Resend quota
  const global = await consume(
    "verify:global:daily",
    DAILY_EMAIL_BUDGET,
    DAY_MS,
  );
  if (!global.allowed) return { ok: false, reason: "service_busy" };

  return null;
};

export const sendVerificationLink = async (email, ip) => {
  const blocked = await checkSendLimits(email, ip);
  if (blocked) return blocked;

  const token = createVerificationToken();

  // Only the newest link is valid
  await VerificationToken.deleteMany({ email });
  await VerificationToken.create({
    email,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
  });

  const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendVerificationEmail(email, link);

  return { ok: true };
};

// Returns the token record if valid and unused, otherwise null.
// findOneAndDelete is atomic, so two simultaneous requests can't both use it.
export const consumeVerificationToken = async (token) => {
  if (!token || typeof token !== "string") return null;
  return await VerificationToken.findOneAndDelete({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
};
