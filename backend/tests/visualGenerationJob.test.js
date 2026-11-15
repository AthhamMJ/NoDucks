import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizePromptEntities,
  screenImageContent,
} from "../src/services/visualSafetyService.js";
import { buildVisualPrompt, COMIC_RULES } from "../src/prompts/visual/v1.js";
import { processGeneration } from "../src/services/visualGenerationJob.js";
import VisualAsset from "../src/models/VisualAsset.js";

describe("Visual Safety & Entity Sanitization", () => {
  test("replaces named F1 teams and sports brands with generic equivalents", () => {
    const raw = "Explain aerodynamics using the Red Bull and Ferrari cars";
    const sanitized = sanitizePromptEntities(raw);
    assert.ok(!sanitized.includes("Red Bull"));
    assert.ok(!sanitized.includes("Ferrari"));
    assert.ok(sanitized.includes("aerodynamic racing car"));
  });

  test("replaces real athletes and celebrities with generic roles", () => {
    const raw = "Show Lewis Hamilton racing against Max Verstappen";
    const sanitized = sanitizePromptEntities(raw);
    assert.ok(!sanitized.includes("Lewis Hamilton"));
    assert.ok(!sanitized.includes("Max Verstappen"));
    assert.ok(sanitized.includes("championship racecar driver"));
  });

  test("screenImageContent flags safety filter violations and empty buffers", () => {
    const emptyCheck = screenImageContent({ buffer: null });
    assert.equal(emptyCheck.passed, false);
    assert.equal(emptyCheck.code, "EMPTY_BUFFER");

    const flaggedCheck = screenImageContent({
      buffer: Buffer.from("valid_buffer"),
      safetyRatings: [{ category: "HATE_SPEECH", probability: "HIGH" }],
    });
    assert.equal(flaggedCheck.passed, false);
    assert.equal(flaggedCheck.code, "SAFETY_FILTER_FLAGGED");

    const cleanCheck = screenImageContent({
      buffer: Buffer.from("valid_buffer"),
      safetyRatings: [{ category: "HATE_SPEECH", probability: "LOW" }],
    });
    assert.equal(cleanCheck.passed, true);
  });
});

describe("Visual Prompt Template v1", () => {
  test("includes required comic rules", () => {
    assert.ok(COMIC_RULES.includes("original characters"));
    assert.ok(COMIC_RULES.includes("no copyrighted characters"));
    assert.ok(COMIC_RULES.includes("no real people"));
    assert.ok(COMIC_RULES.includes("no real brands or team logos"));
    assert.ok(COMIC_RULES.includes("simple clean comic style"));
    assert.ok(COMIC_RULES.includes("labelled diagram elements"));
    assert.ok(COMIC_RULES.includes("no text inside the image except short labels"));
  });

  test("constructs formatted educational prompt", () => {
    const prompt = buildVisualPrompt({
      topic: "Bernoulli's Principle",
      storyTitle: "Apex Speedway",
      visualContext: "Wind tunnel telemetry",
      learningLevel: "intermediate",
    });

    assert.ok(prompt.includes("Bernoulli's Principle"));
    assert.ok(prompt.includes("Apex Speedway"));
    assert.ok(prompt.includes("Wind tunnel telemetry"));
  });
});

describe("Visual Generation Job Worker", () => {
  test("completes generation, updates status to ready, and sets Cloudinary URL", async () => {
    const originalFindById = VisualAsset.findById;
    const originalFindByIdAndUpdate = VisualAsset.findByIdAndUpdate;

    try {
      const mockAsset = {
        _id: "job_asset_1",
        assetKey: "test_key_1234567890abcdef",
        variant: 1,
        topic: "Photosynthesis",
        storyTitle: "The Molecular Kitchen",
        visualContext: "bubbling emulsion flasks",
        learningLevel: "beginner",
        provider: "mock",
        status: "generating",
        caption: "Photosynthesis in the kitchen",
        altText: "A comic panel",
        error: { retries: 0 },
      };

      VisualAsset.findById = async (id) => (id === "job_asset_1" ? mockAsset : null);

      let updatedFields = null;
      VisualAsset.findByIdAndUpdate = async (id, update) => {
        updatedFields = update;
        return { ...mockAsset, ...update };
      };

      await processGeneration("job_asset_1");

      assert.ok(updatedFields);
      assert.equal(updatedFields.status, "ready");
      assert.ok(updatedFields.cloudinary?.url);
      assert.equal(updatedFields.lockExpiresAt, null);
    } finally {
      VisualAsset.findById = originalFindById;
      VisualAsset.findByIdAndUpdate = originalFindByIdAndUpdate;
    }
  });
});
