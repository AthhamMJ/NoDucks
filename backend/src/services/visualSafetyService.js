/**
 * Visual Safety & Moderation Service
 * Sanitizes prompts by replacing real-world entities/brands with generic educational archetypes,
 * and screens generated image responses.
 */

const BRAND_AND_ENTITY_REPLACEMENTS = [
  // F1 & Racing Teams / Brands
  { pattern: /\b(ferrari|red bull|mercedes amg|mclaren|aston martin|williams f1)\b/gi, replacement: "a high-speed aerodynamic racing car" },
  { pattern: /\b(porsche|lamborghini|bugatti|bmw|audi|ford|chevrolet)\b/gi, replacement: "a sleek performance vehicle" },
  
  // Real People / Celebrities / Athletes
  { pattern: /\b(lewis hamilton|max verstappen|charles leclerc|ayrton senna|schumacher)\b/gi, replacement: "a championship racecar driver" },
  { pattern: /\b(lionel messi|cristiano ronaldo|neymar|mbappe|haaland)\b/gi, replacement: "a skilled soccer forward" },
  { pattern: /\b(lebron james|michael jordan|stephen curry|kobe bryant)\b/gi, replacement: "an agile basketball player" },
  { pattern: /\b(elon musk|jeff bezos|bill gates|steve jobs|mark zuckerberg)\b/gi, replacement: "an inventive engineer" },
  
  // Pop Culture / Copyrighted Franchises
  { pattern: /\b(iron man|spider-?man|batman|superman|captain america|avengers)\b/gi, replacement: "a comic superhero in mechanical armor" },
  { pattern: /\b(mario|luigi|pokemon|pikachu|sonic|zelda|link)\b/gi, replacement: "a plucky video game adventurer" },
  { pattern: /\b(star wars|darth vader|luke skywalker|jedi|lightsaber)\b/gi, replacement: "a cosmic star explorer wielding an energy wand" },
  
  // Real sports teams
  { pattern: /\b(real madrid|barcelona|manchester united|liverpool|arsenal|chelsea)\b/gi, replacement: "a premier soccer club team" },
  { pattern: /\b(lakers|warriors|celtics|bulls|yankees|dodgers)\b/gi, replacement: "a professional sports squad" },
];

/**
 * Replaces named real persons, sports franchises, and brands with generic equivalents.
 */
export function sanitizePromptEntities(input) {
  if (!input || typeof input !== "string") return "";
  let sanitized = input;
  for (const { pattern, replacement } of BRAND_AND_ENTITY_REPLACEMENTS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

/**
 * Screens image buffer and provider safety assessment.
 */
export function screenImageContent({ buffer, mimeType, safetyRatings = [] }) {
  if (!buffer || buffer.length === 0) {
    return {
      passed: false,
      code: "EMPTY_BUFFER",
      reason: "Generated image buffer is empty.",
    };
  }

  // Check provider moderation signals if available
  for (const rating of safetyRatings) {
    const probability = String(rating.probability || "").toUpperCase();
    if (probability === "HIGH" || probability === "VERY_HIGH") {
      return {
        passed: false,
        code: "SAFETY_FILTER_FLAGGED",
        reason: `Image content triggered safety filter category: ${rating.category}`,
      };
    }
  }

  return { passed: true };
}

