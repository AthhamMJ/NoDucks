import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  resolveStoryForInterest,
  areStoriesCompatible,
  getDefaultStory,
  STORIES,
} from "../src/services/storyCatalogue.js";
import {
  areVisualContextsCompatible,
  matchOrEnqueueVisualAsset,
} from "../src/services/visualMatchService.js";
import VisualAsset from "../src/models/VisualAsset.js";

describe("Story Catalogue & Story Resolution", () => {
  test("resolves neutral default story when interest is empty or unknown", () => {
    const defaultStory = getDefaultStory();
    assert.equal(resolveStoryForInterest("").id, defaultStory.id);
    assert.equal(resolveStoryForInterest(null).id, defaultStory.id);
    assert.equal(resolveStoryForInterest("something-completely-unrelated-xyz").id, defaultStory.id);
  });

  test("resolves racing story for racing/formula/speed interests", () => {
    assert.equal(resolveStoryForInterest("Formula 1 racing").id, "racing_circuit");
    assert.equal(resolveStoryForInterest("sports cars").id, "racing_circuit");
  });

  test("identifies compatible and incompatible stories", () => {
    assert.equal(areStoriesCompatible("racing_circuit", "racing_circuit"), true);
    assert.equal(areStoriesCompatible("racing_circuit", "speedway"), true);
    assert.equal(areStoriesCompatible("racing_circuit", "culinary_kitchen"), false);
  });

  test("checks visual context compatibility correctly", () => {
    const ctx1 = "A high-tech racing team garage with aerodynamic chassis";
    const ctx2 = "A racing garage with aerodynamic chassis monitors";
    const ctx3 = "Baking sourdough bread inside a stone oven";

    assert.equal(areVisualContextsCompatible(ctx1, ctx2), true);
    assert.equal(areVisualContextsCompatible(ctx1, ctx3), false);
  });
});

describe("Visual Matching Service Order and Reuse", () => {
  // Test unit matching logic using mocked queries
  test("reuses ready asset with exact concept, compatible story, level band, and style", async () => {
    const originalFind = VisualAsset.find;
    const originalUpdateOne = VisualAsset.updateOne;

    try {
      const mockAsset = {
        _id: "asset_123",
        assetKey: "dummy_key",
        conceptId: "kinematics",
        storyId: "racing_circuit",
        visualContext: STORIES.racing_circuit.visualContext,
        learningLevel: "intermediate",
        visualStyle: "comic-clean-v1",
        interestTags: ["racing", "cars"],
        status: "ready",
        reuseCount: 0,
        cloudinary: { publicId: "noducks/visuals/sample", url: "https://res.cloudinary.com/demo/image.webp" },
      };

      // Mock find to return ready asset
      VisualAsset.find = () => ({
        lean: async () => [mockAsset],
      });
      VisualAsset.updateOne = async () => ({ modifiedCount: 1 });

      const result = await matchOrEnqueueVisualAsset({
        conceptId: "kinematics",
        topic: "Velocity and Acceleration",
        interest: "Formula 1 racing",
        learningLevel: "intermediate",
      });

      assert.equal(result.isReused, true);
      assert.equal(result.needsGeneration, false);
      assert.equal(result.asset._id, "asset_123");
    } finally {
      VisualAsset.find = originalFind;
      VisualAsset.updateOne = originalUpdateOne;
    }
  });

  test("ranks among multiple compatible candidates using interest match score", async () => {
    const originalFind = VisualAsset.find;
    const originalUpdateOne = VisualAsset.updateOne;

    try {
      const candidate1 = {
        _id: "candidate_generic",
        conceptId: "energy",
        storyId: "neutral_workshop",
        visualContext: STORIES.neutral_workshop.visualContext,
        learningLevel: "intermediate",
        visualStyle: "comic-clean-v1",
        interestTags: ["general", "science"],
        status: "ready",
      };

      const candidate2 = {
        _id: "candidate_space",
        conceptId: "energy",
        storyId: "space_station",
        visualContext: STORIES.space_station.visualContext,
        learningLevel: "intermediate",
        visualStyle: "comic-clean-v1",
        interestTags: ["space", "astronomy", "rockets"],
        status: "ready",
      };

      VisualAsset.find = () => ({
        lean: async () => [candidate1, candidate2],
      });
      VisualAsset.updateOne = async () => ({ modifiedCount: 1 });

      // Student interest is "rockets and astronomy" -> should rank candidate2 higher
      const result = await matchOrEnqueueVisualAsset({
        conceptId: "energy",
        topic: "Conservation of Energy",
        interest: "rockets and astronomy",
        learningLevel: "intermediate",
      });

      assert.equal(result.isReused, true);
      assert.equal(result.asset._id, "candidate_space");
    } finally {
      VisualAsset.find = originalFind;
      VisualAsset.updateOne = originalUpdateOne;
    }
  });

  test("does not reuse when learning level band does not match", async () => {
    const originalFind = VisualAsset.find;
    const originalFindOne = VisualAsset.findOne;
    const originalCreate = VisualAsset.create;

    try {
      const advancedAsset = {
        _id: "asset_advanced",
        conceptId: "momentum",
        storyId: "racing_circuit",
        visualContext: STORIES.racing_circuit.visualContext,
        learningLevel: "advanced",
        visualStyle: "comic-clean-v1",
        interestTags: ["racing"],
        status: "ready",
      };

      VisualAsset.find = () => ({
        lean: async () => [advancedAsset],
      });
      VisualAsset.findOne = () => ({
        sort: () => ({
          select: () => ({
            lean: async () => ({ variant: 1 }),
          }),
        }),
      });
      VisualAsset.create = async (doc) => ({ ...doc, _id: "new_gen_asset" });

      // Student level is "beginner", existing asset is "advanced" -> should NOT reuse, create new
      const result = await matchOrEnqueueVisualAsset({
        conceptId: "momentum",
        topic: "Momentum",
        interest: "racing",
        learningLevel: "beginner",
      });

      assert.equal(result.isReused, false);
      assert.equal(result.needsGeneration, true);
      assert.equal(result.asset.variant, 2); // variant incremented
    } finally {
      VisualAsset.find = originalFind;
      VisualAsset.findOne = originalFindOne;
      VisualAsset.create = originalCreate;
    }
  });

  test("handles generation lock race condition (code 11000) cleanly without failing", async () => {
    const originalFind = VisualAsset.find;
    const originalFindOne = VisualAsset.findOne;
    const originalCreate = VisualAsset.create;

    try {
      VisualAsset.find = () => ({
        lean: async () => [],
      });
      VisualAsset.findOne = (query) => {
        if (query?.assetKey) {
          return Promise.resolve({
            _id: "in_flight_asset",
            assetKey: query.assetKey,
            status: "generating",
          });
        }
        return {
          sort: () => ({
            select: () => ({
              lean: async () => null,
            }),
          }),
        };
      };

      // Simulate MongoDB duplicate key error (code 11000)
      const duplicateError = new Error("E11000 duplicate key error");
      duplicateError.code = 11000;
      VisualAsset.create = async () => {
        throw duplicateError;
      };

      const result = await matchOrEnqueueVisualAsset({
        conceptId: "thermodynamics",
        topic: "Entropy",
        interest: "cooking",
        learningLevel: "intermediate",
      });

      assert.equal(result.isReused, false);
      assert.equal(result.needsGeneration, false); // in-flight generation caught!
      assert.equal(result.asset._id, "in_flight_asset");
    } finally {
      VisualAsset.find = originalFind;
      VisualAsset.findOne = originalFindOne;
      VisualAsset.create = originalCreate;
    }
  });
});

