import api from "./api";

export async function fetchAdminOverview() {
  const { data } = await api.get("/api/admin/overview");
  return data;
}
export async function fetchAdminUsers(page = 1, limit = 20) {
  const { data } = await api.get("/api/admin/users", {
    params: { page, limit },
  });
  return data;
}
