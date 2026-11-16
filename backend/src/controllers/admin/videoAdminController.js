import multer from "multer";
import VisualAsset from "../../models/VisualAsset.js";
import { normalizeQuery, normalizeAliases } from "../../utils/normalizeQuery.js";
import { buildVideoAssetKey } from "../../utils/visualAssetKey.js";
import { uploadVideo, uploadRawFile } from "../../services/cloudinaryService.js";

// Memory storage for multer so we can directly access file buffers
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max for videos
}).fields([
  { name: "video", maxCount: 1 },
  { name: "captions", maxCount: 1 },
]);

/**
 * Admin: Upload video and captions to Cloudinary, save record in "draft" status.
 * POST /api/admin/videos
 */
export const uploadVideoAdmin = async (req, res, next) => {
  try {
    const { title, subject, conceptId, aliases, altText, caption } = req.body;

    // 1. Basic field validation
    if (!title?.trim() || !subject?.trim() || !conceptId?.trim()) {
      return res.status(400).json({
        message: "Title, subject, and conceptId are required.",
      });
    }

    // 2. Video file validation (MP4)
    const videoFile = req.files?.video?.[0];
    if (!videoFile) {
      return res.status(400).json({ message: "MP4 video file is required." });
    }

    const isMp4 =
      videoFile.mimetype === "video/mp4" ||
      videoFile.originalname?.toLowerCase().endsWith(".mp4");

    if (!isMp4) {
      return res.status(400).json({
        message: "Invalid video file type. Video must be an MP4 file.",
      });
    }

    // 3. Captions file validation (.vtt starting with "WEBVTT")
    const captionsFile = req.files?.captions?.[0];
    if (!captionsFile) {
      return res
        .status(400)
        .json({ message: "Captions file (.vtt) is required." });
    }

    const captionsContent = captionsFile.buffer.toString("utf-8").trim();
    if (!captionsContent.startsWith("WEBVTT")) {
      return res.status(400).json({
        message: "Invalid captions file. File must be a valid WebVTT file starting with 'WEBVTT'.",
      });
    }

    // 4. Aliases validation (non-empty after normalization)
    const normalizedAliasesList = normalizeAliases(aliases);
    if (!normalizedAliasesList.length) {
      return res.status(400).json({
        message: "At least one valid alias is required after normalization.",
      });
    }

    // 5. Normalization of conceptId and topic
    const normalizedConceptId = normalizeQuery(conceptId);
    const normalizedTitle = title.trim();
    const normalizedSubject = subject.toLowerCase().trim();

    // 6. Upload Video to Cloudinary
    // resource_type: "video", folder: "visuals", public_id: conceptId, overwrite: false
    const videoUpload = await uploadVideo({
      buffer: videoFile.buffer,
      publicId: normalizedConceptId,
      folder: "visuals",
      overwrite: false,
      mimeType: "video/mp4",
    });

    const durationSeconds = videoUpload.duration || 30;

    // Validate duration between 10 and 60 seconds
    if (durationSeconds < 10 || durationSeconds > 60) {
      return res.status(400).json({
        message: `Video duration (${durationSeconds}s) must be between 10 and 60 seconds.`,
      });
    }

    // 7. Upload .vtt to Cloudinary (resource_type: "raw")
    const captionsUpload = await uploadRawFile({
      buffer: captionsFile.buffer,
      filename: `${normalizedConceptId}_captions`,
      folder: "visuals",
      mimeType: "text/vtt",
    });

    // 8. Deterministic assetKey
    const assetKey = buildVideoAssetKey({
      conceptId: normalizedConceptId,
      title: normalizedTitle,
      subject: normalizedSubject,
    });

    // 9. Create record in "draft" status (never publish automatically)
    const videoDoc = await VisualAsset.create({
      kind: "video",
      assetKey,
      conceptId: normalizedConceptId,
      subject: normalizedSubject,
      topic: normalizedTitle,
      title: normalizedTitle,
      aliases: normalizedAliasesList,
      cloudinary: {
        publicId: videoUpload.publicId,
        url: videoUpload.url,
      },
      posterUrl: videoUpload.posterUrl,
      captionsUrl: captionsUpload.url,
      durationSeconds,
      altText: altText?.trim() || `Educational video on ${normalizedTitle}`,
      caption: caption?.trim() || `Animation explaining ${normalizedTitle}`,
      status: "draft",
      publishedBy: req.user._id,
    });

    res.status(201).json({ video: videoDoc });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Publish video after manual review.
 * Returns 409 Conflict if record is not in "draft" status.
 * POST /api/admin/videos/:id/publish
 */
export const publishVideoAdmin = async (req, res, next) => {
  try {
    const video = await VisualAsset.findOne({
      _id: req.params.id,
      kind: "video",
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    if (video.status !== "draft") {
      return res.status(409).json({
        message: `Cannot publish video: video is in '${video.status}' status, expected 'draft'.`,
        currentStatus: video.status,
      });
    }

    video.status = "ready";
    video.publishedBy = req.user._id;
    video.updatedAt = new Date();
    await video.save();

    res.json({
      message: "Video published successfully.",
      video,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all video records (drafts & published).
 * GET /api/admin/videos
 */
export const listAdminVideos = async (req, res, next) => {
  try {
    const videos = await VisualAsset.find({ kind: "video" })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ videos });
  } catch (error) {
    next(error);
  }
};
