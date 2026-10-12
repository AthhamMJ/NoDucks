export async function findSubjectsByUser(supabase, userId) {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, color, catalog_id")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function findSubjectCatalog(supabase) {
  const { data, error } = await supabase
    .from("subject_catalog")
    .select("id, name, default_color")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function insertSubject(supabase, subjectData) {
  const { data, error } = await supabase
    .from("subjects")
    .insert(subjectData)
    .select("id, name, color, catalog_id")
    .single();

  if (error) throw error;
  return data;
}
