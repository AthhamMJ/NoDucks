import crypto from "crypto";

/**
 * Cloudinary Upload and Delivery Service
 * Uses native fetch and crypto to upload signed assets to Cloudinary
 * and construct responsive, auto-formatted (f_auto, q_auto) delivery URLs.
 * If credentials are placeholders or not configured, provides a seamless placeholder fallback.
 */

export function isCloudinaryConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  if (
    CLOUDINARY_CLOUD_NAME.includes("placeholder") ||
    CLOUDINARY_API_KEY.includes("placeholder") ||
    CLOUDINARY_API_SECRET.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

/**
 * Generates a signed Cloudinary signature for the provided parameters.
 */
export function generateSignature(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  return crypto.createHash("sha1").update(serialized + apiSecret).digest("hex");
}

/**
 * Builds responsive, auto-format, auto-quality delivery URL for an image.
 */
export function buildDeliveryUrl(publicId, options = {}) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "noducks-cloud";
  const { width = 1024, quality = "auto", format = "auto" } = options;
  const cleanPublicId = publicId.replace(/^\//, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_${format},q_${quality},w_${width},c_limit/${cleanPublicId}`;
}

/**
 * Uploads an image buffer or base64 string to Cloudinary.
 * Never exposes Cloudinary secrets to frontend.
 */
export async function uploadImage({ buffer, mimeType = "image/png", publicId, folder = "noducks/visuals" }) {
  const chosenPublicId = publicId || `visual_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const fullPublicId = folder ? `${folder}/${chosenPublicId}` : chosenPublicId;

  if (!isCloudinaryConfigured()) {
    // Graceful placeholder fallback when Cloudinary API credentials are placeholders
    return {
      publicId: fullPublicId,
      url: buildDeliveryUrl(fullPublicId),
      isPlaceholder: true,
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);

  const signParams = {
    folder,
    public_id: chosenPublicId,
    timestamp,
  };

  const signature = generateSignature(signParams, apiSecret);

  const base64Data = Buffer.isBuffer(buffer)
    ? `data:${mimeType};base64,${buffer.toString("base64")}`
    : buffer.startsWith("data:")
    ? buffer
    : `data:${mimeType};base64,${buffer}`;

  const formData = new URLSearchParams();
  formData.append("file", base64Data);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("folder", folder);
  formData.append("public_id", chosenPublicId);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return {
    publicId: result.public_id,
    url: buildDeliveryUrl(result.public_id),
    format: result.format,
    width: result.width,
    height: result.height,
  };
}

/**
 * Builds poster frame URL from a Cloudinary video public_id (frame at so_0).
 */
export function buildPosterUrl(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "noducks-cloud";
  const cleanPublicId = publicId.replace(/^\//, "").replace(/\.[^/.]+$/, "");
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${cleanPublicId}.jpg`;
}

/**
 * Uploads an MP4 video file to Cloudinary.
 * folder: "visuals", public_id from conceptId, overwrite false.
 */
export async function uploadVideo({
  buffer,
  publicId,
  folder = "visuals",
  overwrite = false,
  mimeType = "video/mp4",
}) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "noducks-cloud";
  const chosenPublicId = publicId || `video_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const fullPublicId = folder ? `${folder}/${chosenPublicId}` : chosenPublicId;

  if (!isCloudinaryConfigured()) {
    return {
      publicId: fullPublicId,
      url: `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto/${fullPublicId}.mp4`,
      posterUrl: buildPosterUrl(fullPublicId),
      duration: 30, // Default mock duration within valid range (10-60s)
      isPlaceholder: true,
    };
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);

  const signParams = {
    folder,
    overwrite: overwrite ? "true" : "false",
    public_id: chosenPublicId,
    timestamp,
  };

  const signature = generateSignature(signParams, apiSecret);

  const base64Data = Buffer.isBuffer(buffer)
    ? `data:${mimeType};base64,${buffer.toString("base64")}`
    : buffer.startsWith("data:")
    ? buffer
    : `data:${mimeType};base64,${buffer}`;

  const formData = new URLSearchParams();
  formData.append("file", base64Data);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("folder", folder);
  formData.append("public_id", chosenPublicId);
  formData.append("overwrite", overwrite ? "true" : "false");
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary video upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const resPublicId = result.public_id;
  return {
    publicId: resPublicId,
    url: result.secure_url || result.url || `https://res.cloudinary.com/${cloudName}/video/upload/${resPublicId}.mp4`,
    posterUrl: buildPosterUrl(resPublicId),
    duration: Math.round(result.duration || 30),
    format: result.format,
  };
}

/**
 * Uploads a raw file (e.g. .vtt subtitles) to Cloudinary.
 */
export async function uploadRawFile({
  buffer,
  filename,
  folder = "visuals",
  mimeType = "text/vtt",
}) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "noducks-cloud";
  const chosenPublicId = filename
    ? filename.replace(/\.[^/.]+$/, "")
    : `captions_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const fullPublicId = folder ? `${folder}/${chosenPublicId}` : chosenPublicId;

  if (!isCloudinaryConfigured()) {
    return {
      publicId: fullPublicId,
      url: `https://res.cloudinary.com/${cloudName}/raw/upload/${fullPublicId}.vtt`,
      isPlaceholder: true,
    };
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);

  const signParams = {
    folder,
    public_id: chosenPublicId,
    timestamp,
  };

  const signature = generateSignature(signParams, apiSecret);

  const base64Data = Buffer.isBuffer(buffer)
    ? `data:${mimeType};base64,${buffer.toString("base64")}`
    : buffer.startsWith("data:")
    ? buffer
    : `data:${mimeType};base64,${buffer}`;

  const formData = new URLSearchParams();
  formData.append("file", base64Data);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("folder", folder);
  formData.append("public_id", chosenPublicId);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary raw file upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return {
    publicId: result.public_id,
    url: result.secure_url || result.url || `https://res.cloudinary.com/${cloudName}/raw/upload/${result.public_id}.vtt`,
  };
}


