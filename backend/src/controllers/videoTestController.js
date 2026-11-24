import { createVideoJob, getVideoJob } from '../services/videoService.js';

export async function runVideoTest(req, res) {
  try {
    const job = await createVideoJob({
      topic: req.body?.topic || 'gravitational force',
      ageBand: req.body?.ageBand || '14-16',
      interest: req.body?.interest || 'cars',
    });
    const status = await getVideoJob(job.job_id);
    res.json({ created: job, status });
  } catch (err) {
    res.status(502).json({
      error: {
        category: err.category || 'API',
        code: err.code || 'API_UNREACHABLE',
        message: err.message,
      },
    });
  }
}

export async function getVideoStatus(req, res) {
  try {
    const jobId = req.query.job_id || req.query.jobId;
    if (!jobId) {
      return res.status(400).json({
        error: {
          category: 'VALIDATION',
          code: 'MISSING_JOB_ID',
          message: 'job_id query parameter is required',
        },
      });
    }
    const status = await getVideoJob(jobId);
    res.json(status);
  } catch (err) {
    const statusCode = err.status && err.status < 500 ? err.status : 502;
    res.status(statusCode).json({
      error: {
        category: err.category || 'API',
        code: err.code || 'API_UNREACHABLE',
        message: err.message,
      },
    });
  }
}
