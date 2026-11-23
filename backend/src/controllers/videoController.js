import { streamVideo } from '../services/videoService.js';

export async function getLessonVideo(req, res) {
  try {
    const upstream = await streamVideo(req.params.jobId);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch (err) {
    const status = err.status && err.status < 500 ? err.status : 502;
    res.status(status).json({
      error: {
        category: err.category || 'API',
        code: err.code || 'API_UNREACHABLE',
        message: err.message,
      },
    });
  }
}