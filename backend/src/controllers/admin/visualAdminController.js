import VisualAsset from "../../models/VisualAsset.js";

/**
 * Admin Controller for Visual Asset statistics
 * GET /api/admin/visuals
 */
export const getVisualStats = async (req, res) => {
  try {
    const [statusCounts, reuseAggregation] = await Promise.all([
      VisualAsset.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      VisualAsset.aggregate([
        {
          $group: {
            _id: null,
            totalReuses: { $sum: "$reuseCount" },
            totalAssets: { $sum: 1 },
          },
        },
      ]),
    ]);

    const counts = {
      generating: 0,
      ready: 0,
      failed: 0,
      total: 0,
    };

    for (const item of statusCounts) {
      if (item._id && counts[item._id] !== undefined) {
        counts[item._id] = item.count;
      }
      counts.total += item.count;
    }

    const totalReuses = reuseAggregation[0]?.totalReuses || 0;
    const totalAssets = reuseAggregation[0]?.totalAssets || 0;
    const totalRequestsServed = totalAssets + totalReuses;
    const reuseRate =
      totalRequestsServed > 0
        ? Number(((totalReuses / totalRequestsServed) * 100).toFixed(1))
        : 0;

    res.json({
      counts,
      totalReuses,
      reuseRate, // Percentage formatted
    });
  } catch (error) {
    console.error("getVisualStats error:", error);
    res.status(500).json({ message: "Failed to load visual asset statistics." });
  }
};

