export function isMissingTable(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /schema cache|does not exist/i.test(error?.message || "")
  );
}

export function cleanName(value) {
  return value.replace(/\s+/g, " ").trim();
}

export function sortByName(list) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

export function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDue(value) {
  const date = parseDate(value);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function isOverdue(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDate(value) < today;
}
