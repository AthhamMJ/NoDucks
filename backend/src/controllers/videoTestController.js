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