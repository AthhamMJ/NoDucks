/**
 * Normalizes user queries and topic aliases for matching video lessons.
 * 
 * Rules:
 * 1. Unicode NFKD normalization & strip diacritics
 * 2. Convert to lowercase
 * 3. Convert curly/smart apostrophes to straight apostrophes (')
 * 4. Remove punctuation while preserving alphanumeric characters and spaces
 * 5. Normalize possessives and contractions so that "Newton's" and "newtons" produce the same token
 * 6. Collapse consecutive whitespace and trim
 * 
 * Example:
 * "Newton's second law", "newtons second law", and "NEWTON’S SECOND LAW"
 * all normalize to "newtons second law".
 */
export function normalizeQuery(query) {
  if (!query || typeof query !== "string") {
    return "";
  }

  return (
    query
      // 1. Unicode NFKD decomposition & strip accents/diacritics
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      // 2. Lowercase
      .toLowerCase()
      // 3. Curly and stylized apostrophes to standard straight apostrophe
      .replace(/[’‘`‛′]/g, "'")
      // 4. Strip punctuation other than alphanumeric and apostrophe
      .replace(/[^a-z0-9\s']/g, " ")
      // 5. Remove apostrophes so possessives/apostrophes match identical non-punctuated forms
      // (e.g. "newton's" -> "newtons", "fourier's" -> "fouriers")
      .replace(/'/g, "")
      // 6. Collapse multiple spaces and trim
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Normalizes an array or comma-separated string of aliases.
 * Filters out any empty values after normalization.
 */
export function normalizeAliases(aliases) {
  if (!aliases) return [];

  const rawList = Array.isArray(aliases)
    ? aliases
    : String(aliases).split(",");

  const set = new Set();
  for (const item of rawList) {
    const normalized = normalizeQuery(item);
    if (normalized.length > 0) {
      set.add(normalized);
    }
  }

  return Array.from(set);
}
