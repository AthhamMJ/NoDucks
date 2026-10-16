import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import { getDBStatus } from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";

const app = express();

// .use ellam middleware
app.use(cors());
app.use(express.json());

// knowing that the application is running
app.get("/", (req, res) => {
  res.send("Backend Server is running...");
});

//Health Check Route
app.get("/api/health", (req, res) => {
  const db = getDBStatus();

  res.status(db.isConnected ? 200 : 503).json({
    status: db.isConnected ? "UP" : "DOWN",
    server: "Running",
    database: db.status,
    timstamp: new Date().toISOString(),
  });
});

// route section
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/tasks", taskRoutes)

// Protected Route
app.get("/api/protected-test", protect, (req, res) => {
  res.json({ message: `Access granted! Welcome user ID: ${req.user}` });
});

export default app;
