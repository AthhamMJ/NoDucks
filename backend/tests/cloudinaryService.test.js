import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateSignature,
  buildDeliveryUrl,
  uploadImage,
  isCloudinaryConfigured,
} from "../src/services/cloudinaryService.js";

describe("Cloudinary Service", () => {
  test("generates correct signed SHA-1 signature for sorted parameters", () => {
    const params = {
      folder: "noducks/visuals",
      public_id: "test_asset_1",
      timestamp: 1234567890,
    };
    const secret = "my_api_secret";

    // Expected: sha1("folder=noducks/visuals&public_id=test_asset_1&timestamp=1234567890" + "my_api_secret")
    const signature = generateSignature(params, secret);
    assert.equal(typeof signature, "string");
    assert.equal(signature.length, 40); // SHA-1 hex length is 40 chars
  });

  test("builds delivery URL with f_auto, q_auto and width transformation", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo-cloud";
    const url = buildDeliveryUrl("noducks/visuals/sample_123", { width: 800 });
    assert.ok(url.includes("https://res.cloudinary.com/demo-cloud/image/upload/"));
    assert.ok(url.includes("f_auto,q_auto,w_800,c_limit/noducks/visuals/sample_123"));
  });

  test("handles placeholder credentials safely without crashing", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "placeholder_cloud";
    process.env.CLOUDINARY_API_KEY = "placeholder_key";
    process.env.CLOUDINARY_API_SECRET = "placeholder_secret";

    assert.equal(isCloudinaryConfigured(), false);

    const dummyBuffer = Buffer.from("dummy image content");
    const result = await uploadImage({
      buffer: dummyBuffer,
      mimeType: "image/png",
      publicId: "sample_asset_key",
    });

    assert.ok(result.publicId.includes("sample_asset_key"));
    assert.ok(result.url.includes("sample_asset_key"));
    assert.equal(result.isPlaceholder, true);
  });
});

