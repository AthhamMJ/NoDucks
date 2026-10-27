import dotEnv from 'dotenv/config';
import connectDB from './config/db.js';
import app from './app.js';

// dotEnv.config();

await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on ${PORT}`)
})