import { test, describe } from "node:test";
import assert from "node:assert/strict";
import Lesson from "../src/models/Lesson.js";
import VisualAsset from "../src/models/VisualAsset.js";
import { getLessonVisuals } from "../src/controllers/lessonController.js";

describe("Lesson Visuals API", () => {
  test("getLessonVisuals fetches real-time asset status and sets Cache-Control when all ready", async () => {
    const originalFindOne = Lesson.findOne;
    const originalFindById = VisualAsset.findById;

    try {
      const mockVisualAsset = {
        _id: "6736dd65b750cbba8a1a1111",
        status: "ready",
        cloudinary: { url: "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/test.webp" },
        caption: "A high-speed comic panel",
        altText: "A comic panel illustrating velocity",
      };

      const mockLesson = {
        _id: "6736dd65b750cbba8a1a2222",
        visuals: [
          {
            assetId: "6736dd65b750cbba8a1a1111",
            status: "pending",
          },
        ],
      };

      Lesson.findOne = () => ({
        select: () => ({
          lean: async () => mockLesson,
        }),
      });

      VisualAsset.findById = () => ({
        lean: async () => mockVisualAsset,
      });

      const req = {
        params: { id: "6736dd65b750cbba8a1a2222" },
        user: { _id: "6736dd65b750cbba8a1a3333" },
      };

      const headers = {};
      let jsonResponse = null;

      const res = {
        set: (key, val) => {
          headers[key] = val;
        },
        json: (val) => {
          jsonResponse = val;
        },
      };

      await getLessonVisuals(req, res, () => {});

      assert.ok(jsonResponse);
      assert.equal(jsonResponse.visuals.length, 1);
      assert.equal(jsonResponse.visuals[0].status, "ready");
      assert.equal(jsonResponse.visuals[0].url, mockVisualAsset.cloudinary.url);
      assert.equal(headers["Cache-Control"], "public, max-age=86400");
    } finally {
      Lesson.findOne = originalFindOne;
      VisualAsset.findById = originalFindById;
    }
  });

  test("getLessonVisuals returns 400 on invalid lesson ID", async () => {
    let statusCode = 200;
    let jsonResponse = null;

    const req = {
      params: { id: "invalid-id" },
      user: { _id: "user_1" },
    };

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (val) => {
            jsonResponse = val;
          },
        };
      },
    };

    await getLessonVisuals(req, res, () => {});
    assert.equal(statusCode, 400);
    assert.ok(jsonResponse.message.includes("Invalid lesson id"));
  });
});

