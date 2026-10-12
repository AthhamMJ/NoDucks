import {
  createTaskSchema,
  updateTaskSchema,
  toggleTaskSchema,
} from "../models/task.model.js";
import {
  findTasksByUser,
  insertTask,
  updateTaskRecord,
  deleteTaskRecord,
} from "../repositories/task.repository.js";

export async function getUserTasks(supabase, userId) {
  return findTasksByUser(supabase, userId);
}

export async function createUserTask(supabase, userId, rawData) {
  const validated = createTaskSchema.parse(rawData);
  const taskData = {
    ...validated,
    user_id: userId,
  };
  return insertTask(supabase, taskData);
}

export async function updateUserTask(supabase, taskId, userId, rawData) {
  const validated = updateTaskSchema.parse(rawData);
  return updateTaskRecord(supabase, taskId, userId, validated);
}

export async function toggleUserTask(supabase, taskId, userId, rawData) {
  const { is_completed } = toggleTaskSchema.parse(rawData);
  return updateTaskRecord(supabase, taskId, userId, { is_completed });
}

export async function deleteUserTask(supabase, taskId, userId) {
  return deleteTaskRecord(supabase, taskId, userId);
}
