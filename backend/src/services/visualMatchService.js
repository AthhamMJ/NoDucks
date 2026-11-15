import VisualAsset from "../models/VisualAsset.js";
import {
  buildAssetKey,
  normalizeLearningLevelBand,
  normalizeToken,
} from "../utils/visualAssetKey.js";
import {
  resolveStoryForInterest,
  areStoriesCompatible,
  getDefaultStory,
} from "./storyCatalogue.js";

/**
 * Checks compatibility between two visual contexts.
 * Contexts are compatible if identical or sharing core keywords.
 */
export function areVisualContextsCompatible(contextA, contextB) {
  const normA = normalizeToken(contextA);
  const normB = normalizeToken(contextB);
  if (!normA || !normB) return true; // if one is generic, accept as compatible
  if (normA === normB) return true;

  const wordsA = new Set(normA.split(" ").filter((w) => w.length > 3));
  const wordsB = normB.split(" ").filter((w) => w.length > 3);
  const shared = wordsB.filter((w) => wordsA.has(w));
  return shared.length >= 2;
}

/**
 * Calculates an interest similarity score to rank candidates (Step f).
 * Does not block reuse; only ranks among compatible candidates.
 */
function scoreInterestMatch(assetTags = [], studentInterest = "") {
  if (!studentInterest || !assetTags.length) return 0;
  const interestTokens = studentInterest.toLowerCase().split(/\s+/);
  let score = 0;
  for (const tag of assetTags) {
    const normTag = tag.toLowerCase();
    for (const token of interestTokens) {
      if (normTag.includes(token) || token.includes(normTag)) {
        score += 1;
      }
    }
  }
  return score;
}

/**
 * Matches existing ready visual assets or initiates a new variant / generation lock.
 * Matching Cascade:
 *  a. Exact conceptId
 *  b. Compatible storyId
 *  c. Compatible visualContext
 *  d. Learning level within same band
 *  e. Same visualStyle
 *  f. Interest match (ranking only)
 */
export async function matchOrEnqueueVisualAsset({
  conceptId,
  topic,
  subject = "general",
  interest = "",
  learningLevel = "intermediate",
  visualStyle = "comic-clean-v1",
  promptVersion = "v1",
  provider = "gemini",
}) {
  const normConceptId = normalizeToken(conceptId || topic);
  const targetBand = normalizeLearningLevelBand(learningLevel);
  const story = resolveStoryForInterest(interest) || getDefaultStory();

  // 1. Fetch ready candidates for exact conceptId (Rule a)
  const candidates = await VisualAsset.find({
    conceptId: normConceptId,
    status: "ready",
  }).lean();

  const compatibleCandidates = [];

  for (const candidate of candidates) {
    // b. Compatible storyId
    if (!areStoriesCompatible(candidate.storyId, story.id)) {
      continue;
    }

    // c. Compatible visualContext
    if (!areVisualContextsCompatible(candidate.visualContext, story.visualContext)) {
      continue;
    }

    // d. Learning level within same band
    const candidateBand = normalizeLearningLevelBand(candidate.learningLevel);
    if (candidateBand !== targetBand) {
      continue;
    }

    // e. Same visualStyle
    if (normalizeToken(candidate.visualStyle) !== normalizeToken(visualStyle)) {
      continue;
    }

    // Candidate passed all strict filter steps!
    // f. Compute interest score for ranking
    const rankScore = scoreInterestMatch(candidate.interestTags, interest);
    compatibleCandidates.push({ candidate, rankScore });
  }

  // If any ready asset matches, rank and return it! (Do not generate)
  if (compatibleCandidates.length > 0) {
    compatibleCandidates.sort((a, b) => b.rankScore - a.rankScore);
    const chosen = compatibleCandidates[0].candidate;

    // Increment reuse counter asynchronously
    await VisualAsset.updateOne(
      { _id: chosen._id },
      { $inc: { reuseCount: 1 } }
    ).catch(() => {});

    return {
      asset: chosen,
      isReused: true,
      needsGeneration: false,
    };
  }

  // 2. No ready match exists. Prepare deterministic assetKey
  const assetKey = buildAssetKey({
    conceptId: normConceptId,
    storyId: story.id,
    visualContext: story.visualContext,
    visualStyle,
    learningLevel: targetBand,
    promptVersion,
  });

  // Calculate variant for this concept (Requirement 3: "different story creates a new variant")
  const highestVariantAsset = await VisualAsset.findOne({
    conceptId: normConceptId,
  })
    .sort({ variant: -1 })
    .select("variant")
    .lean();

  const nextVariant = highestVariantAsset ? highestVariantAsset.variant + 1 : 1;

  // 3. Attempt to create generating record with unique generation lock
  try {
    const newAsset = await VisualAsset.create({
      assetKey,
      variant: nextVariant,
      conceptId: normConceptId,
      subject,
      topic,
      learningLevel: targetBand,
      storyId: story.id,
      storyTitle: story.title,
      visualContext: story.visualContext,
      interestTags: story.interestTags,
      visualStyle,
      promptVersion,
      provider,
      status: "generating",
      lockExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min lock
      caption: `Comic explanation of ${topic} through ${story.title}`,
      altText: `A comic-style panel illustrating ${topic} using a ${story.title} analogy`,
    });

    return {
      asset: newAsset,
      isReused: false,
      needsGeneration: true,
    };
  } catch (err) {
    // Check if error is duplicate key on generation lock ({ assetKey: 1, status: "generating" })
    if (err.code === 11000) {
      // Another worker is already generating this assetKey!
      const existingGenerating = await VisualAsset.findOne({ assetKey });
      if (existingGenerating) {
        return {
          asset: existingGenerating,
          isReused: false,
          needsGeneration: false, // already in-flight!
        };
      }
    }
    throw err;
  }
}

