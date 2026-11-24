import express from 'express';
import { runVideoTest, getVideoStatus } from '../controllers/videoTestController.js';

const router = express.Router();

router.post('/test', runVideoTest);
router.get('/status', getVideoStatus);

export default router;
