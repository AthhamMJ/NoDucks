import dotEnv from 'dotenv/config';
import connectDB from './config/db.js';
import app from './app.js';
import { resumeStalledGenerations } from './services/visualGenerationJob.js';
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// dotEnv.config();

const openapiSpec = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./docs/openapi.json", import.meta.url)),
    "utf8"
  )
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

await connectDB();
resumeStalledGenerations().catch(() => {});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on ${PORT}`)
})