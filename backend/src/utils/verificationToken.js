import crypto from "crypto";

export const VERIFY_TTL_MS = 30 * 60 * 1000; // 30 mins

export const createVerificationToken = () =>
  crypto.randomBytes(32).toString("base64Url");


//Store only a SHA-256 hash. Unlike passwords, random tokens don't need bcrypt and the fast hash lets us look token up directly
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
