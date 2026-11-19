import connectDB from "../config/db.js";
import VisualAsset from "../models/VisualAsset.js";
import { normalizeAliases, normalizeQuery } from "../utils/normalizeQuery.js";
import { buildVideoAssetKey } from "../utils/visualAssetKey.js";
import "dotenv/config";

await connectDB();

export const sampleVideos = [
  {
    title: "Gravitational Force",
    conceptId: "Gravitational force",
    subject: "physics",
    aliases: [
      "gravity",
      "gravitational force",
      "free fall",
      "gravitational acceleration",
      "gravitation",
    ],
    durationSeconds: 45,
    cloudinary: {
      publicId: "visuals/gravitational_force",
      url: "Source_URL_HERE",
    },
    posterUrl: "",
    captionsUrl: "",
    caption: "Visual demonstration of mutual attraction and gravitational acceleration.",
    altText: "Orbital trajectories and gravitational pull simulation.",
    status: "ready",
  },
];

for (const v of sampleVideos) {
  const normConcept = normalizeQuery(v.conceptId);
  const normAliases = normalizeAliases(v.aliases);
  const assetKey = buildVideoAssetKey({
    conceptId: normConcept,
    title: v.title,
    subject: v.subject,
  });

  await VisualAsset.findOneAndUpdate(
    { assetKey, kind: "video" },
    {
      kind: "video",
      assetKey,
      conceptId: normConcept,
      subject: v.subject.toLowerCase().trim(),
      topic: v.title,
      title: v.title,
      aliases: normAliases,
      cloudinary: v.cloudinary,
      posterUrl: v.posterUrl,
      captionsUrl: v.captionsUrl,
      durationSeconds: v.durationSeconds,
      caption: v.caption,
      altText: v.altText,
      status: v.status,
    },
    { upsert: true, returnDocument: "after" },
  );

  console.log(`✅ Seeded ready video: ${v.title}`);
}

console.log("🎬 Video seeding complete!");
process.exit(0);
