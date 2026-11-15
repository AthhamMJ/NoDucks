import { generateMockImage } from "./mockImageAdapter.js";
import { generateGeminiImage } from "./geminiImageAdapter.js";

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
  const provider = getImageProvider(providerName);
  return provider.generateImage({ prompt, width, height });
}

