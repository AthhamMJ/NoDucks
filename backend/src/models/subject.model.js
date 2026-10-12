import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Subject name is required").max(40, "Subject name is too long"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format").optional(),
  catalog_id: z.string().nullable().optional(),
});
