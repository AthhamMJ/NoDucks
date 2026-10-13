// import {
//   getUserTasks,
//   createUserTask,
//   updateUserTask,
//   toggleUserTask,
//   deleteUserTask,
// } from "../services/task.service.js";

// export async function getTasks(req, res) {
//   try {
//     const tasks = await getUserTasks(req.supabase, req.user.id);
//     return res.json({ tasks });
//   } catch (error) {
//     console.error("Failed to get tasks:", error);
//     return res.status(500).json({
//       error: error.message || "Failed to load tasks.",
//       code: error.code,
//     });
//   }
// }

// export async function createTask(req, res) {
//   try {
//     const task = await createUserTask(req.supabase, req.user.id, req.body);
//     return res.status(201).json({ task });
//   } catch (error) {
//     if (error?.name === "ZodError") {
//       return res.status(400).json({ error: error.issues[0]?.message || "Invalid task data." });
//     }
//     console.error("Failed to create task:", error);
//     return res.status(400).json({
//       error: error.message || "Failed to create task.",
//       code: error.code,
//     });
//   }
// }

// export async function updateTask(req, res) {
//   try {
//     const { id } = req.params;
//     const task = await updateUserTask(req.supabase, id, req.user.id, req.body);
//     return res.json({ task });
//   } catch (error) {
//     if (error?.name === "ZodError") {
//       return res.status(400).json({ error: error.issues[0]?.message || "Invalid task data." });
//     }
//     console.error("Failed to update task:", error);
//     return res.status(400).json({
//       error: error.message || "Failed to update task.",
//       code: error.code,
//     });
//   }
// }

// export async function toggleTask(req, res) {
//   try {
//     const { id } = req.params;
//     const task = await toggleUserTask(req.supabase, id, req.user.id, req.body);
//     return res.json({ task });
//   } catch (error) {
//     if (error?.name === "ZodError") {
//       return res.status(400).json({ error: error.issues[0]?.message || "Invalid toggle data." });
//     }
//     console.error("Failed to toggle task:", error);
//     return res.status(400).json({
//       error: error.message || "Failed to update task.",
//       code: error.code,
//     });
//   }
// }

// export async function deleteTask(req, res) {
//   try {
//     const { id } = req.params;
//     await deleteUserTask(req.supabase, id, req.user.id);
//     return res.json({ message: "Task deleted successfully." });
//   } catch (error) {
//     console.error("Failed to delete task:", error);
//     return res.status(400).json({
//       error: error.message || "Failed to delete task.",
//       code: error.code,
//     });
//   }
// }
