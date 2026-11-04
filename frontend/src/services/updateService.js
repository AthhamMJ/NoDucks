// api sender for the feature updates
import api from "./api";

export async function fetchLatestUpdate() {
  const { data } = await api.get("/api/updates/latest");
  return data;
}
