//public feature getter function
import FeatureUpdate from "../models/admin/FeatureUpdate.js";

export const getLatestUpdate = async (req, res) => {
  try {
    const update = await FeatureUpdate.findOne()
      .sort({ createdAt: -1 })
      .select("title content createdAt")
      .lean();

    res.json({ update: update || null });
  } catch (error) {
    console.error("getLatestUpdate error:", error);
    res.status(500).json({ message: "Failed to load the latest update" });
  }
};