const BASE_URL = process.env.VIDEO_SERVICE_URL;
const TOKEN = process.env.VIDEO_SERVICE_TOKEN;

async function callService(path, options = {}) {
  if (!BASE_URL || !TOKEN) {
    throw new Error('VIDEO_SERVICE_URL or VIDEO_SERVICE_TOKEN is not set');
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Token': TOKEN,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Pass the service's error through, so the log shows the real category and code.
    const err = new Error(data?.error?.message || data?.detail?.message || `service returned ${res.status}`);
    err.category = data?.error?.category || data?.detail?.category || 'API';
    err.code = data?.error?.code || data?.detail?.code || `HTTP_${res.status}`;
    throw err;
  }
  return data;
}

export async function createVideoJob({ topic, ageBand, interest, requestId }) {
  return callService('/jobs', {
    method: 'POST',
    body: JSON.stringify({ topic, age_band: ageBand, interest, request_id: requestId ?? null }),
  });
}

export async function getVideoJob(jobId) {
  return callService(`/jobs/${encodeURIComponent(jobId)}`);
}

export async function streamVideo(jobId) {
  if (!BASE_URL || !TOKEN) {
    throw new Error('VIDEO_SERVICE_URL or VIDEO_SERVICE_TOKEN is not set');
  }
  const res = await fetch(`${BASE_URL}/drafts/served/${encodeURIComponent(jobId)}`, {
    headers: { 'X-Service-Token': TOKEN },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.detail?.message || `service returned ${res.status}`);
    err.category = data?.detail?.category || 'API';
    err.code = data?.detail?.code || `HTTP_${res.status}`;
    err.status = res.status;
    throw err;
  }
  return res;
}