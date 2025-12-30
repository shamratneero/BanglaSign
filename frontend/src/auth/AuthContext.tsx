import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../lib/publicAuthApi";
import type { Me } from "../lib/publicAuthApi";

export type AuthContextValue = {
  me: Me | null;
  loading: boolean;
  refreshMe: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const data = await api.me();
      setMe(data);
    } catch {
      setMe(null);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      await api.login(username, password);
      await refreshMe();
    },
    [refreshMe]
  );

  const register = useCallback(
    async (username: string, password: string) => {
      await api.register(username, password);
      await refreshMe();
    },
    [refreshMe]
  );

  const logout = useCallback(async () => {
    await api.logout();
    setMe(null);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshMe();
      setLoading(false);
    })();
  }, [refreshMe]);

  const value = useMemo(
    () => ({ me, loading, refreshMe, login, register, logout }),
    [me, loading, refreshMe, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
