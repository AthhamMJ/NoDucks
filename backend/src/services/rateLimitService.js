import RateLimit from "../models/RateLimit.js";

const buildResult = (doc, limit, now) => ({
  allowed: doc.count <= limit,
  count: doc.count,
  retryAfterSec: Math.max(0, Math.ceil((doc.expiresAt - now) / 1000)),
});

// Increments a counter for `key` within a fixed window.
// Returns { allowed, count, retryAfterSec }.
export const consume = async (key, limit, windowMs) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  // 1. Count against the active window
  const doc = await RateLimit.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true },
  );
  if (doc) return buildResult(doc, limit, now);

  // 2. No active window: start one, or replace an expired one
  try {
    const created = await RateLimit.findOneAndUpdate(
      { key, expiresAt: { $lte: now } },
      { $set: { count: 1, windowStart: now, expiresAt } },
      { upsert: true, new: true },
    );
    return buildResult(created, limit, now);
  } catch (err) {
    if (err.code !== 11000) throw err;

    // Another request created the window at the same moment: count against it
    const existing = await RateLimit.findOneAndUpdate(
      { key, expiresAt: { $gt: now } },
      { $inc: { count: 1 } },
      { new: true },
    );
    return buildResult(existing, limit, now);
  }
};