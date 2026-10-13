import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { protect } from './middleware/authMiddleware.js'
// import taskRoutes from "./routes/task.routes.js";
// import subjectRoutes from "./routes/subject.routes.js";

const app = express()

// .use ellam middleware
app.use(cors());
app.use(express.json());

// route section 
app.use('/api/auth', authRoutes);

// Protected Route
app.get('/api/protected-test', protect, (req, res) => {
  res.json({message: `Access granted! Welcome user ID: ${req.user}`});
})

export default app;