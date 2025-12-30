// frontend/src/lib/publicAuthApi.ts

export type Me = {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
    is_active: boolean;
  };
  
  async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const data = await res.json();
        msg = data?.detail || JSON.stringify(data);
      } catch {}
      throw new Error(msg);
    }
  
    return res.json() as Promise<T>;
  }
  
  export function login(username: string, password: string) {
    return request<{ detail: string }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }
  
  // IMPORTANT: backend requires username + password only
  export function register(username: string, password: string) {
    return request<{ detail: string }>("/api/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }
  
  export function me() {
    return request<Me>("/api/me", { method: "GET" });
  }
  
  export function logout() {
    return request<{ detail: string }>("/api/logout", { method: "POST" });
  }
  