import { findProfileById } from "../repositories/profile.repository.js";
import { validateProfile } from "../models/profile.model.js";

export async function getAuthenticatedProfile(supabase, user) {
  const profile = await findProfileById(supabase, user.id);

  return validateProfile(profile);
}
