import { test, describe } from "node:test";
import assert from "node:assert/strict";
import VisualAsset from "../src/models/VisualAsset.js";
import { getVisualStats } from "../src/controllers/admin/visualAdminController.js";

describe("Visual Admin Controller", () => {
  test("getVisualStats calculates status counts and reuse rate properly", async () => {
    const originalAggregate = VisualAsset.aggregate;

    try {
      VisualAsset.aggregate = async (pipeline) => {
        // First pipeline groups by $status
        if (pipeline[0]?.$group?._id === "$status") {
          return [
            { _id: "ready", count: 15 },
            { _id: "generating", count: 2 },
            { _id: "failed", count: 1 },
          ];
        }
        // Second pipeline groups totalReuses and totalAssets
        return [
          {
            _id: null,
            totalReuses: 10,
            totalAssets: 18,
          },
        ];
      };

      let jsonResponse = null;
      const res = {
        json: (val) => {
          jsonResponse = val;
        },
      };

      await getVisualStats({}, res);

      assert.ok(jsonResponse);
      assert.equal(jsonResponse.counts.ready, 15);
      assert.equal(jsonResponse.counts.generating, 2);
      assert.equal(jsonResponse.counts.failed, 1);
      assert.equal(jsonResponse.counts.total, 18);
      assert.equal(jsonResponse.totalReuses, 10);
      // reuseRate = (10 / (18 + 10)) * 100 = (10 / 28) * 100 = 35.7%
      assert.equal(jsonResponse.reuseRate, 35.7);
    } finally {
      VisualAsset.aggregate = originalAggregate;
    }
  });
});

