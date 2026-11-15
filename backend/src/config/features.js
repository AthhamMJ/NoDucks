/**
 * Feature Flags Configuration
 * Controls feature rollouts safely.
 */

export const IMAGE_GENERATION_ENABLED =
  process.env.IMAGE_GENERATION_ENABLED === "true";

