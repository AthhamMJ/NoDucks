import connectDB from "../config/db.js";
import VisualAsset from "../models/VisualAsset.js";
import { normalizeAliases, normalizeQuery } from "../utils/normalizeQuery.js";
import { buildVideoAssetKey } from "../utils/visualAssetKey.js";
import "dotenv/config";

await connectDB();

export const sampleVideos = [
  {
    title: "Newton's Second Law of Motion",
    conceptId: "Newton's Second Law",
    subject: "physics",
    aliases: [
      "Newton's second law",
      "newtons second law",
      "NEWTON’S SECOND LAW",
      "f = ma",
      "force equals mass times acceleration",
      "newtons law",
    ],
    durationSeconds: 45,
    cloudinary: {
      publicId: "visuals/newton_s_second_law",
      url: "https://res.cloudinary.com/gwobhyvb/video/upload/v1794821432/newton_s_second_law.mp4",
    },
    posterUrl: "https://res.cloudinary.com/gwobhyvb/video/upload/so_0/newton_s_second_law.jpg",
    captionsUrl: "",
    caption: "A Manim visual demonstration showing how net force accelerates mass according to F = ma.",
    altText: "Animated physics simulation showing vector forces and acceleration on varying masses.",
    status: "ready",
  },
  {
    title: "Gravity and Free Fall",
    conceptId: "Gravity",
    subject: "physics",
    aliases: [
      "gravity",
      "free fall",
      "gravitational force",
      "gravitational acceleration",
      "gravitation",
    ],
    durationSeconds: 38,
    cloudinary: {
      publicId: "visuals/newton_s_second_law",
      url: "https://res.cloudinary.com/gwobhyvb/video/upload/v1794821432/newton_s_second_law.mp4",
    },
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    captionsUrl: "data:text/vtt;charset=utf-8,WEBVTT%0A%0A00:00:00.000%20--%3E%2000:00:05.000%0AUnderstanding%20gravitational%20acceleration%20and%20curved%20spacetime.",
    caption: "Geometric visualization of gravitational pull and acceleration.",
    altText: "Animated visualization of orbital trajectories and free fall mechanics.",
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
    { upsert: true, returnDocument: 'after' }
  );

  console.log(`✅ Seeded ready video: ${v.title}`);
}

console.log("🎬 Video seeding complete!");
process.exit(0);
