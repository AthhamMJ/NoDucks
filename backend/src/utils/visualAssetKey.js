import crypto from "crypto";

/**
 * Normalizes learning level into a standard band.
 * Levels:
 * - elementary / beginner / intro -> "beginner"
 * - middle / intermediate / standard -> "intermediate"
 * - high / advanced / college / university -> "advanced"
 */
export function normalizeLearningLevelBand(level) {
  if (!level) return "intermediate";
  const str = String(level).toLowerCase().trim();
  if (/beginner|elementary|primary|easy|basic|intro/i.test(str)) {
    return "beginner";
  }
  if (/advanced|college|university|expert|hard/i.test(str)) {
    return "advanced";
  }
  return "intermediate";
}

/**
 * Normalizes a string value (lowercase, trimmed, collapsed whitespace).
 */
export function normalizeToken(val, defaultVal = "") {
  if (val === undefined || val === null) return defaultVal;
  return String(val)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Computes a deterministic SHA-256 assetKey from canonical values.
 * Excludes personal data and raw student interests so assets can be reused across students.
 */
export function buildAssetKey({
  conceptId,
  storyId,
  visualContext,
  visualStyle = "comic-clean-v1",
  learningLevel,
  promptVersion = "v1",
}) {
  const normalized = {
    conceptId: normalizeToken(conceptId),
    learningLevelBand: normalizeLearningLevelBand(learningLevel),
    promptVersion: normalizeToken(promptVersion, "v1"),
    storyId: normalizeToken(storyId),
    visualContext: normalizeToken(visualContext),
    visualStyle: normalizeToken(visualStyle, "comic-clean-v1"),
  };

  // Sort keys alphabetically for canonical JSON representation
  const canonicalObj = {};
  for (const key of Object.keys(normalized).sort()) {
    canonicalObj[key] = normalized[key];
  }

  const canonicalJson = JSON.stringify(canonicalObj);
  return crypto.createHash("sha256").update(canonicalJson).digest("hex");
}

/**
 * Computes a deterministic SHA-256 assetKey for videos.
 */
export function buildVideoAssetKey({ conceptId, title = "", subject = "general" }) {
  const normalized = {
    conceptId: normalizeToken(conceptId),
    kind: "video",
    subject: normalizeToken(subject, "general"),
    title: normalizeToken(title),
  };

  const canonicalObj = {};
  for (const key of Object.keys(normalized).sort()) {
    canonicalObj[key] = normalized[key];
  }

  const canonicalJson = JSON.stringify(canonicalObj);
  return crypto.createHash("sha256").update(canonicalJson).digest("hex");
}

