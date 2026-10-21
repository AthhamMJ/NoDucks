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

export function sortByRecent(list) {
  return [...list].sort(
    (a, b) =>
      new Date(b.updated_at ?? b.created_at) -
      new Date(a.updated_at ?? a.created_at),
  );
}

export function timeAgo(dateString) {
  if (!dateString) return "";
  const minutes = Math.floor((Date.now() - new Date(dateString)) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
