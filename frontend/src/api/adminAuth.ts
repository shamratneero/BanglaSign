import axios from "axios";

const api = axios.create({
  baseURL: "",            // <- forces same-origin (8080 gateway)
  withCredentials: true,
});

export async function adminLogin(username: string, password: string) {
  const res = await api.post("/api/admin/auth/login/", { username, password });
  return res.data;
}

export async function adminMe() {
  const res = await api.get("/api/admin/auth/me/");
  return res.data;
}

export async function adminLogout() {
  const res = await api.post("/api/admin/auth/logout/");
  return res.data;
}
