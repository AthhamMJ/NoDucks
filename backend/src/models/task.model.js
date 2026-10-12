import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().trim().max(500, "Description is too long").nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  subject_id: z.string().uuid("Invalid subject ID").nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  is_completed: z.boolean().optional(),
});

export const toggleTaskSchema = z.object({
  is_completed: z.boolean(),
});
