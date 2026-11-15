import { generateMockImage } from "./mockImageAdapter.js";
import { generateGeminiImage } from "./geminiImageAdapter.js";
import { IMAGE_GENERATION_ENABLED } from "../../config/features.js";

/**
 * Image Provider Registry
 * Returns an adapter implementing generateImage({ prompt, width, height })
 */
const PROVIDERS = {
  mock: generateMockImage,
  gemini: generateGeminiImage,
};

export function getImageProvider(name) {
  const chosenName = (name || process.env.IMAGE_PROVIDER || "gemini").toLowerCase().trim();
  const adapter = PROVIDERS[chosenName] || PROVIDERS.gemini;
  return {
    name: chosenName,
    generateImage: adapter,
  };
}

export async function generateImage({ prompt, width = 1024, height = 768, providerName }) {
  const isEnabled =
    typeof process !== "undefined" && process.env.NODE_ENV === "test"
      ? process.env.IMAGE_GENERATION_ENABLED === "true"
      : IMAGE_GENERATION_ENABLED;

  if (!isEnabled) {
    return { status: "caption-only" };
  }
  const provider = getImageProvider(providerName);
  return provider.generateImage({ prompt, width, height });
}

