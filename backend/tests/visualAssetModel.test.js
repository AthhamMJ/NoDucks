import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  buildAssetKey,
  normalizeLearningLevelBand,
  normalizeToken,
} from "../src/utils/visualAssetKey.js";
import VisualAsset from "../src/models/VisualAsset.js";

describe("VisualAsset Key & Model Schema", () => {
  test("deterministic assetKey produces identical hash for same inputs regardless of key order", () => {
    const key1 = buildAssetKey({
      conceptId: "photosynthesis",
      storyId: "solar_bakery",
      visualContext: "chloroplast kitchen making glucose bread",
      visualStyle: "comic-clean-v1",
      learningLevel: "beginner",
      promptVersion: "v1",
    });

    const key2 = buildAssetKey({
      promptVersion: "v1",
      learningLevel: "beginner",
      visualStyle: "comic-clean-v1",
      visualContext: "chloroplast kitchen making glucose bread",
      storyId: "solar_bakery",
      conceptId: "photosynthesis",
    });

    assert.equal(key1, key2);
    assert.equal(typeof key1, "string");
    assert.equal(key1.length, 64); // SHA-256 produces 64 hex chars
  });

  test("deterministic assetKey ignores whitespace and casing differences", () => {
    const key1 = buildAssetKey({
      conceptId: "  PhotoSynthesis  ",
      storyId: " Solar_Bakery ",
      visualContext: "chloroplast   kitchen",
      learningLevel: "Beginner",
    });

    const key2 = buildAssetKey({
      conceptId: "photosynthesis",
      storyId: "solar_bakery",
      visualContext: "chloroplast kitchen",
      learningLevel: "elementary",
    });

    assert.equal(key1, key2);
  });

  test("deterministic assetKey changes when key properties change", () => {
    const base = {
      conceptId: "gravity",
      storyId: "skatepark",
      visualContext: "halfpipe ramp showing potential energy",
      visualStyle: "comic-clean-v1",
      learningLevel: "intermediate",
      promptVersion: "v1",
    };

    const baseKey = buildAssetKey(base);

    const diffStoryKey = buildAssetKey({
      ...base,
      storyId: "space_orbit",
    });

    const diffContextKey = buildAssetKey({
      ...base,
      visualContext: "rollercoaster loop",
    });

    const diffLevelKey = buildAssetKey({
      ...base,
      learningLevel: "advanced",
    });

    const diffVersionKey = buildAssetKey({
      ...base,
      promptVersion: "v2",
    });

    assert.notEqual(baseKey, diffStoryKey);
    assert.notEqual(baseKey, diffContextKey);
    assert.notEqual(baseKey, diffLevelKey);
    assert.notEqual(baseKey, diffVersionKey);
  });

  test("learning level band maps various strings to standardized bands", () => {
    assert.equal(normalizeLearningLevelBand("elementary"), "beginner");
    assert.equal(normalizeLearningLevelBand("introductory"), "beginner");
    assert.equal(normalizeLearningLevelBand("middle school"), "intermediate");
    assert.equal(normalizeLearningLevelBand("intermediate"), "intermediate");
    assert.equal(normalizeLearningLevelBand("advanced"), "advanced");
    assert.equal(normalizeLearningLevelBand("college"), "advanced");
    assert.equal(normalizeLearningLevelBand(null), "intermediate");
  });

  test("Mongoose model indexes are defined as required by architecture", () => {
    const indexes = VisualAsset.schema.indexes();

    // Check compound unique assetKey + variant index
    const compoundUnique = indexes.find(
      ([fields, opts]) => fields.assetKey === 1 && fields.variant === 1 && opts?.unique === true
    );
    assert.ok(compoundUnique, "Missing compound unique index on assetKey + variant");

    // Check conceptId + storyId lookup index
    const conceptStoryIndex = indexes.find(
      ([fields]) => fields.conceptId === 1 && fields.storyId === 1
    );
    assert.ok(conceptStoryIndex, "Missing lookup index on conceptId + storyId");

    // Check generation lock partial unique index
    const lockIndex = indexes.find(
      ([fields, opts]) =>
        fields.assetKey === 1 &&
        opts?.unique === true &&
        opts?.partialFilterExpression?.status === "generating"
    );
    assert.ok(lockIndex, "Missing generation lock unique partial index");
  });
});

