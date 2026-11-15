/**
 * Prompt Template Version 1
 * Generates comic-style conceptual illustrations for academic concepts.
 */

export const PROMPT_VERSION = "v1";

export const COMIC_RULES = `
original characters, no copyrighted characters, no real people, no real brands or team logos, age-appropriate, simple clean comic style, labelled diagram elements, no text inside the image except short labels.
`.trim();

/**
 * Builds the visual image generation prompt.
 */
export function buildVisualPrompt({
  topic,
  conceptAspect = "",
  storyTitle = "The Wonder Workshop",
  visualContext = "",
  learningLevel = "intermediate",
}) {
  return [
    `A clean, vibrant comic-style educational illustration explaining "${topic}".`,
    conceptAspect ? `Key scientific focus: ${conceptAspect}.` : "",
    `Story setting: "${storyTitle}" - ${visualContext}.`,
    `Target student comprehension level: ${learningLevel}.`,
    `Visual Style & Rules:`,
    COMIC_RULES,
  ]
    .filter(Boolean)
    .join("\n");
}
