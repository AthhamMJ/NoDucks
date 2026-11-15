import { GoogleGenAI } from "@google/genai";
import { generateMockImage } from "./mockImageAdapter.js";

/**
 * Gemini / Imagen Provider Adapter
 * Implements generateImage({ prompt, width, height })
 */
export async function generateGeminiImage({ prompt, width = 1024, height = 768 }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    return generateMockImage({ prompt, width, height });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "mern-conceptbridge" } },
    });

    // Try Imagen generation model
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png",
        aspectRatio: "4:3",
      },
    });

    const generatedImage = response.generatedImages?.[0]?.image;
    if (generatedImage?.imageBytes) {
      const buffer = Buffer.from(generatedImage.imageBytes, "base64");
      return {
        buffer,
        mimeType: "image/png",
        width,
        height,
        safetyRatings: response.generatedImages[0]?.safetyRatings || [],
      };
    }

    // Fallback if imageBytes not returned
    return generateMockImage({ prompt, width, height });
  } catch (err) {
    console.warn("Gemini/Imagen generateImages failed, falling back to mock adapter:", err.message);
    return generateMockImage({ prompt, width, height });
  }
}

