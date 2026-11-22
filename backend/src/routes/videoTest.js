import express from 'express';
import { runVideoTest } from '../controllers/videoTestController.js';

const router = express.Router();

router.post('/test', runVideoTest);

export default router;