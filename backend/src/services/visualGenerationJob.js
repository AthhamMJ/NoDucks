import VisualAsset from "../models/VisualAsset.js";
import { buildVisualPrompt } from "../prompts/visual/v1.js";
import { sanitizePromptEntities, screenImageContent } from "./visualSafetyService.js";
import { generateImage } from "./imageAdapters/imageProvider.js";
import { uploadImage } from "./cloudinaryService.js";

/**
 * Background Job Worker for Visual Asset Generation
 * Manages async generation, safety screening, Cloudinary storage, retries with backoff,
 * and restart recovery.
 */

const MAX_RETRIES = 3;

/**
 * Processes a visual generation task for a specific asset.
 */
export async function processGeneration(assetId) {
  const asset = await VisualAsset.findById(assetId);
  if (!asset || asset.status === "ready") {
    return;
  }

  const currentRetries = asset.error?.retries || 0;

  try {
    // 1. Sanitize story context and entities
    const sanitizedTopic = sanitizePromptEntities(asset.topic);
    const sanitizedStoryTitle = sanitizePromptEntities(asset.storyTitle);
    const sanitizedVisualContext = sanitizePromptEntities(asset.visualContext);

    // 2. Build prompt
    const prompt = buildVisualPrompt({
      topic: sanitizedTopic,
      storyTitle: sanitizedStoryTitle,
      visualContext: sanitizedVisualContext,
      learningLevel: asset.learningLevel,
    });

    // 3. Generate image using configured adapter
    const generated = await generateImage({
      prompt,
      providerName: asset.provider,
    });

    // 4. Safety screening
    const safetyCheck = screenImageContent({
      buffer: generated.buffer,
      mimeType: generated.mimeType,
      safetyRatings: generated.safetyRatings,
    });

    if (!safetyCheck.passed) {
      const err = new Error(safetyCheck.reason);
      err.code = safetyCheck.code;
      throw err;
    }

    // 5. Upload to Cloudinary
    const uploadResult = await uploadImage({
      buffer: generated.buffer,
      mimeType: generated.mimeType,
      publicId: `asset_${asset.assetKey.slice(0, 16)}_${asset.variant}`,
      folder: "noducks/visuals",
    });

    // 6. Mark asset ready and remove generation lock
    await VisualAsset.findByIdAndUpdate(assetId, {
      status: "ready",
      cloudinary: {
        publicId: uploadResult.publicId,
        url: uploadResult.url,
      },
      lockExpiresAt: null,
      caption: asset.caption || `Comic explanation of ${asset.topic}`,
      altText: asset.altText || `A comic-style illustration showing ${asset.topic}`,
      "error.code": "",
      "error.message": "",
    });
  } catch (err) {
    console.error(`Visual generation failed for asset ${assetId}:`, err.message);

    const nextRetries = currentRetries + 1;
    const isFatal = nextRetries >= MAX_RETRIES || err.code === "SAFETY_FILTER_FLAGGED";

    if (!isFatal) {
      // Exponential backoff retry
      const backoffMs = Math.pow(2, nextRetries) * 500;
      await VisualAsset.findByIdAndUpdate(assetId, {
        "error.code": err.code || "RETRYABLE_ERROR",
        "error.message": err.message,
        "error.retries": nextRetries,
      });

      setTimeout(() => {
        processGeneration(assetId).catch(() => {});
      }, backoffMs);
    } else {
      // Mark permanently failed
      await VisualAsset.findByIdAndUpdate(assetId, {
        status: "failed",
        lockExpiresAt: null,
        "error.code": err.code || "MAX_RETRIES_EXCEEDED",
        "error.message": err.message,
        "error.retries": nextRetries,
      });
    }
  }
}

/**
 * Enqueues a generation job in the background without blocking the caller.
 */
export function enqueueGeneration(assetId) {
  setImmediate(() => {
    processGeneration(assetId).catch((err) => {
      console.error(`Unhandled error in background visual generation (${assetId}):`, err);
    });
  });
}

/**
 * On server startup (Render instances can restart):
 * Recovers and re-queues any assets stuck in "generating" state for longer than timeout.
 */
export async function resumeStalledGenerations(timeoutMinutes = 5) {
  try {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    const stalled = await VisualAsset.find({
      status: "generating",
      updatedAt: { $lt: cutoff },
    }).select("_id");

    if (stalled.length > 0) {
      console.log(`Found ${stalled.length} stalled visual generation jobs. Resuming...`);
      for (const asset of stalled) {
        enqueueGeneration(asset._id);
      }
    }
  } catch (err) {
    console.warn("Could not check for stalled visual generation jobs on startup:", err.message);
  }
}

