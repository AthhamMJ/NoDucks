import { z } from "zod";

export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  role: z.enum(["student", "admin"]),
});

export function validateProfile(profile) {
  return profileSchema.parse(profile);
}
