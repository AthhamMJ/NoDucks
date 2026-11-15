import dotEnv from 'dotenv/config';
import connectDB from './config/db.js';
import app from './app.js';
import { resumeStalledGenerations } from './services/visualGenerationJob.js';

// dotEnv.config();

await connectDB();
resumeStalledGenerations().catch(() => {});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on ${PORT}`)
})