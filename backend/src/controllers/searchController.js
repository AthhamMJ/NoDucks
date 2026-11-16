import { searchVideos } from "../services/videoMatchService.js";

/**
 * Search ready video lessons.
 * GET /api/search/videos?q=...
 */
export const searchVideosHandler = async (req, res, next) => {
  try {
    const query = req.query?.q || "";
    const videos = await searchVideos(query, 5);

    if (videos.length > 0) {
      res.set("Cache-Control", "public, max-age=86400");
    }

    res.json({ videos });
  } catch (error) {
    next(error);
  }
};
