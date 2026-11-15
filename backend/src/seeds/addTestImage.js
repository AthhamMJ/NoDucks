// backend/src/scripts/addTestImage.js
import connectDB from "../config/db.js";
import VisualAsset from "../models/VisualAsset.js";
import { buildAssetKey } from "../utils/visualAssetKey.js";
import { STORIES, resolveStoryForInterest } from "../services/storyCatalogue.js";
import "dotenv/config";

await connectDB();

const topic = "newton's second law"; // <- your existing topic
const interest = "racing"; // <- or whatever interest
const story = resolveStoryForInterest(interest);

const assetKey = buildAssetKey({
  conceptId: topic.toLowerCase().trim(),
  storyId: story.id,
  visualContext: story.visualContext,
  visualStyle: "comic-clean-v1",
  learningLevel: "intermediate",
  promptVersion: "v1",
});

await VisualAsset.findOneAndUpdate(
  { assetKey, variant: 1 },
  {
    assetKey,
    variant: 1,
    conceptId: topic.toLowerCase().trim(),
    topic,
    subject: "physics",
    storyId: story.id,
    storyTitle: story.title,
    visualContext: story.visualContext,
    interestTags: story.interestTags,
    status: "ready",
    cloudinary: {
      publicId: "custom_test_image",
      // Put your image URL here (Cloudinary, Imgur, Unsplash, or any public image URL):
      url: "https://res.cloudinary.com/gwobhyvb/image/upload/v1794721137/1b947c90-f42f-4d40-a949-6882f3e22b34.webp", 
    },
    caption: `Visual explanation of ${topic} through ${story.title}`,
    altText: `A custom illustration explaining ${topic}`,
  },
  { upsert: true, new: true }
);

console.log("✅ Test visual asset registered! Ready to view in lesson.");
process.exit(0);