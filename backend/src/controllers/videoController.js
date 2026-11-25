import {
  createVideoJob,
  getVideoJob,
  lookupVideo,
  streamVideo,
} from '../services/videoService.js';

function sendError(res, err) {
  const status = err.status && err.status < 500 ? err.status : 502;
  res.status(status).json({
    error: {
      category: err.category || 'API',
      code: err.code || 'API_UNREACHABLE',
      message: err.message,
    },
  });
}

// Called when a lesson opens. Never creates a job.
export async function lookupLessonVideo(req, res) {
  try {
    const { topic, ageBand, interest } = req.query;
    if (!topic || !ageBand || !interest) {
      return res.status(400).json({
        error: { category: 'VALIDATION', code: 'MISSING_FIELDS',
          message: 'topic, ageBand and interest are required' },
      });
    }
    res.json(await lookupVideo({ topic, ageBand, interest }));
  } catch (err) {
    if (err.code === 'FETCH_NOT_CACHED') {
      return res.status(404).json({ error: { category: err.category, code: err.code, message: err.message } });
    }
    sendError(res, err);
  }
}

// Called only when the student clicks Generate.
export async function generateLessonVideo(req, res) {
  try {
    const { topic, ageBand, interest } = req.body || {};
    if (!topic || !ageBand || !interest) {
      return res.status(400).json({
        error: { category: 'VALIDATION', code: 'MISSING_FIELDS',
          message: 'topic, ageBand and interest are required' },
      });
    }
    const job = await createVideoJob({ topic, ageBand, interest });
    const status = await getVideoJob(job.job_id);
    res.status(202).json({ created: job, status });
  } catch (err) {
    sendError(res, err);
  }
}

export async function getVideoStatus(req, res) {
  try {
    const jobId = req.query.job_id || req.query.jobId;
    if (!jobId) {
      return res.status(400).json({
        error: { category: 'VALIDATION', code: 'MISSING_JOB_ID',
          message: 'job_id query parameter is required' },
      });
    }
    res.json(await getVideoJob(jobId));
  } catch (err) {
    sendError(res, err);
  }
}

export async function getLessonVideo(req, res) {
  try {
    const upstream = await streamVideo(req.params.jobId);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    sendError(res, err);
  }
}