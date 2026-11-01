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

export async function updateAdminUser(id, changes) {
  const { data } = await api.patch(`/api/admin/users/${id}`, changes);
  return data.user;
}

export async function deleteAdminUser(id) {
  const { data } = await api.delete(`/api/admin/users/${id}`);
  return data;
}

export async function fetchAdminSettings() {
  const { data } = await api.get("/api/admin/settings");
  return data;
}

export async function updateAdminQuotas(quotas) {
  const { data } = await api.patch("/api/admin/settings/quotas", quotas);
  return data.quotas;
}
