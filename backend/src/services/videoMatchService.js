import VisualAsset from "../models/VisualAsset.js";
import { normalizeQuery } from "../utils/normalizeQuery.js";

/**
 * Formats a video document for public API response.
 * Strictly includes only:
 * id, title, subject, durationSeconds, cloudinary.url, posterUrl, captionsUrl, altText, caption.
 * Excludes admin/internal fields.
 */
export function formatVideoResponse(video) {
  if (!video) return null;

  return {
    id: video._id,
    title: video.title || "",
    subject: video.subject || "general",
    durationSeconds: video.durationSeconds || 0,
    cloudinary: {
      url: video.cloudinary?.url || "",
    },
    posterUrl: video.posterUrl || "",
    captionsUrl: video.captionsUrl || "",
    altText: video.altText || "",
    caption: video.caption || "",
  };
}

/**
 * Finds a matching published video for a lesson.
 * 
 * Matching order (implement exactly this order):
 * 1. Exact conceptId match, when the lesson already knows its concept.
 * 2. Normalized query equals one of the record's aliases.
 * 3. Same subject as the student's lesson, used to rank results. Never use subject to block a match.
 * 
 * Only status "ready" and kind "video" records are ever returned to students.
 */
export async function findVideoForLesson({ conceptId, query, subject = "" }) {
  const normConcept = conceptId ? normalizeQuery(conceptId) : "";
  const normQuery = query ? normalizeQuery(query) : normConcept;
  const targetSubject = subject ? subject.toLowerCase().trim() : "";

  // Collect candidate matches
  let candidates = [];

  // 1. Exact conceptId match
  if (normConcept) {
    const conceptMatches = await VisualAsset.find({
      kind: "video",
      status: "ready",
      conceptId: normConcept,
    }).lean();

    candidates.push(...conceptMatches);
  }

  // 2. Normalized query equals one of the record's aliases
  if (normQuery) {
    const aliasMatches = await VisualAsset.find({
      kind: "video",
      status: "ready",
      aliases: normQuery,
    }).lean();

    for (const match of aliasMatches) {
      if (!candidates.some((c) => c._id.toString() === match._id.toString())) {
        candidates.push(match);
      }
    }
  }

  if (!candidates.length) {
    return null;
  }

  // 3. Same subject as student's lesson: used to rank results (never to block a match)
  const scored = candidates.map((cand) => {
    let score = 0;
    // Step 1 priority: conceptId exact match gets a baseline boost
    if (normConcept && cand.conceptId === normConcept) {
      score += 10;
    }
    // Step 2 priority: alias exact match
    if (normQuery && cand.aliases?.includes(normQuery)) {
      score += 5;
    }
    // Step 3 priority: subject match ranks higher
    if (targetSubject && cand.subject?.toLowerCase().trim() === targetSubject) {
      score += 2;
    }

    return {
      cand,
      score,
      publishedAt: cand.updatedAt || cand.createdAt || 0,
    };
  });

  // Sort by highest rank score, then most recently published
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  return formatVideoResponse(scored[0].cand);
}

/**
 * Searches ready videos by query string.
 * Returns up to `limit` videos. Returns [] for queries shorter than 3 characters after normalization.
 */
export async function searchVideos(query, limit = 5) {
  const norm = normalizeQuery(query);
  if (!norm || norm.length < 3) {
    return [];
  }

  // Search exact conceptId or alias match
  const matches = await VisualAsset.find({
    kind: "video",
    status: "ready",
    $or: [
      { conceptId: norm },
      { aliases: norm },
      { aliases: { $in: [new RegExp(norm, "i")] } },
    ],
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return matches.map(formatVideoResponse);
}
