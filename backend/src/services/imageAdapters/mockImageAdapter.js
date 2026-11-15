/**
 * Mock Image Adapter
 * Generates an educational comic illustration placeholder PNG for offline/test environments.
 */

// Minimal valid PNG buffer
const FALLBACK_PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJAD/sY6DDFAAAAAElFTkSuQmCC",
  "base64"
);

export async function generateMockImage({ prompt, width = 1024, height = 768 }) {
  // Simulate rapid async generation
  await new Promise((r) => setTimeout(r, 10));

  return {
    buffer: FALLBACK_PNG_BUFFER,
    mimeType: "image/png",
    width,
    height,
    safetyRatings: [],
  };
}

