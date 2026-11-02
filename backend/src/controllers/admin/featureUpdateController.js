import FeatureUpdate from "../../models/admin/FeatureUpdate.js";

export const listUpdates = async (req, res) => {
  try {
    const updates = await FeatureUpdate.find().sort({ createdAt: -1 }).lean();
    res.json({ updates });
  } catch (error) {
    console.error("listUpdates error:", error);
    res.status(500).json({ message: "Failed to load updates" });
  }
};

export const createUpdate = async (req, res) => {
  try {
    const title = req.body?.title?.trim();
    const content = req.body?.content?.trim();

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const update = await FeatureUpdate.create({
      title,
      content,
      createdBy: req.user._id,
    });

    res.status(201).json({ update });
  } catch (error) {
    console.error("createUpdate error:", error);
    res.status(500).json({ message: "Failed to save update" });
  }
};

export const deleteUpdate = async (req, res) => {
  try {
    const item = await FeatureUpdate.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Update not found" });
    }
    res.json({ message: "Update deleted" });
  } catch (error) {
    console.error("deleteUpdate error:", error);
    res.status(500).json({ message: "Failed to delete update" });
  }
};
