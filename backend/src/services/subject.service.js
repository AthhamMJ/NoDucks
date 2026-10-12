import { createSubjectSchema } from "../models/subject.model.js";
import {
  findSubjectsByUser,
  findSubjectCatalog,
  insertSubject,
} from "../repositories/subject.repository.js";

const DEFAULT_SUBJECT_COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#8B5CF6",
];

export async function getUserSubjects(supabase, userId) {
  return findSubjectsByUser(supabase, userId);
}

export async function getCatalog(supabase) {
  return findSubjectCatalog(supabase);
}

export async function addUserSubject(supabase, userId, rawData) {
  const validated = createSubjectSchema.parse(rawData);
  const cleanName = validated.name.trim();
  const key = cleanName.toLowerCase();

  const existingList = await findSubjectsByUser(supabase, userId);
  let linkedCatalogId = validated.catalog_id || null;
  let chosenColor = validated.color || null;

  if (!linkedCatalogId) {
    const catalog = await findSubjectCatalog(supabase);
    const match = catalog.find((c) => c.name.toLowerCase() === key);
    if (match) {
      linkedCatalogId = match.id;
      chosenColor = chosenColor || match.default_color;
    }
  }

  const existing = existingList.find(
    (s) =>
      s.name.toLowerCase() === key ||
      (linkedCatalogId && s.catalog_id === linkedCatalogId),
  );
  if (existing) return existing;

  const subjectData = {
    user_id: userId,
    name: cleanName,
    color:
      chosenColor ||
      DEFAULT_SUBJECT_COLORS[existingList.length % DEFAULT_SUBJECT_COLORS.length],
    catalog_id: linkedCatalogId,
  };

  try {
    return await insertSubject(supabase, subjectData);
  } catch (error) {
    if (error.code === "23505") {
      const fresh = await findSubjectsByUser(supabase, userId);
      const matched = fresh.find(
        (s) =>
          s.name.toLowerCase() === key ||
          (linkedCatalogId && s.catalog_id === linkedCatalogId),
      );
      if (matched) return matched;
    }
    throw error;
  }
}
