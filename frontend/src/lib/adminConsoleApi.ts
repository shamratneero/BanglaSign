import axios from "axios";

// IMPORTANT: use gateway same-origin
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true,
});

export async function adminOverview() {
  const res = await api.get("/api/admin/overview/");
  return res.data;
}

export async function listModels() {
  const res = await api.get("/api/admin/models/");
  return res.data;
}

export async function uploadModel(fd: FormData) {
  const res = await api.post("/api/admin/models/upload/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function toggleModel(id: number, enabled: boolean) {
  const res = await api.post(`/api/admin/models/${id}/toggle/`, { enabled });
  return res.data;
}

export async function activateModel(id: number) {
  const res = await api.post(`/api/admin/models/${id}/activate/`, {});
  return res.data;
}

export async function adminLogout() {
  const res = await api.post("/api/admin/auth/logout/", {});
  return res.data;
}
