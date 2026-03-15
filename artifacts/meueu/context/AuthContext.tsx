import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import { getApiUrl } from "@/utils/api";

const domain = getApiUrl();

const KEYS = {
  ACCESS_TOKEN: "@meueu_access_token",
  REFRESH_TOKEN: "@meueu_refresh_token",
  USER: "@meueu_auth_user",
};

const storage = {
  getItem: (key: string): Promise<string | null> =>
    Platform.OS === "web"
      ? Promise.resolve(localStorage.getItem(key))
      : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> =>
    Platform.OS === "web"
      ? Promise.resolve(localStorage.setItem(key, value))
      : SecureStore.setItemAsync(key, value),
  deleteItem: (key: string): Promise<void> =>
    Platform.OS === "web"
      ? Promise.resolve(localStorage.removeItem(key))
      : SecureStore.deleteItemAsync(key),
};

function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenExpiringSoon(token: string): boolean {
  const exp = decodeJwtExpiry(token);
  if (!exp) return true;
  return exp - Date.now() < 60 * 1000;
}

export type AuthUser = {
  id: number;
  email: string;
  name: string;
};

type AuthState = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, deviceId?: string) => Promise<{ success: boolean; error?: string; newDeviceId?: string }>;
  logout: () => Promise<void>;
  migrateAnonymousData: (anonymousDeviceId: string) => Promise<{ newDeviceId?: string }>;
  getAccessToken: () => Promise<string | null>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isLoggedIn: false, isLoading: true });

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const storedRefresh = await storage.getItem(KEYS.REFRESH_TOKEN);
    if (!storedRefresh) return null;

    try {
      const res = await fetch(`${domain}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });
      if (!res.ok) {
        await clearTokens();
        return null;
      }
      const data = await res.json();
      await storage.setItem(KEYS.ACCESS_TOKEN, data.accessToken);
      await storage.setItem(KEYS.REFRESH_TOKEN, data.refreshToken);
      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const token = await storage.getItem(KEYS.ACCESS_TOKEN);
    if (!token) return null;
    if (isTokenExpiringSoon(token)) {
      return refreshAccessToken();
    }
    return token;
  }, [refreshAccessToken]);

  const clearTokens = async () => {
    await storage.deleteItem(KEYS.ACCESS_TOKEN);
    await storage.deleteItem(KEYS.REFRESH_TOKEN);
    await storage.deleteItem(KEYS.USER);
    setState({ user: null, isLoggedIn: false, isLoading: false });
  };

  useEffect(() => {
    (async () => {
      const userRaw = await storage.getItem(KEYS.USER);
      const accessToken = await storage.getItem(KEYS.ACCESS_TOKEN);

      if (!userRaw || !accessToken) {
        setState({ user: null, isLoggedIn: false, isLoading: false });
        return;
      }

      if (isTokenExpiringSoon(accessToken)) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          setState({ user: null, isLoggedIn: false, isLoading: false });
          return;
        }
      }

      try {
        const user: AuthUser = JSON.parse(userRaw);
        setState({ user, isLoggedIn: true, isLoading: false });
      } catch {
        setState({ user: null, isLoggedIn: false, isLoading: false });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${domain}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return { success: false, error: data.error ?? "Erro ao fazer login." };

      await storage.setItem(KEYS.ACCESS_TOKEN, data.accessToken);
      await storage.setItem(KEYS.REFRESH_TOKEN, data.refreshToken);
      await storage.setItem(KEYS.USER, JSON.stringify(data.user));
      setState({ user: data.user, isLoggedIn: true, isLoading: false });
      return { success: true };
    } catch {
      return { success: false, error: "Erro de conexão. Tente novamente." };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, deviceId?: string) => {
    try {
      const res = await fetch(`${domain}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, deviceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return { success: false, error: data.error ?? "Erro ao criar conta." };

      await storage.setItem(KEYS.ACCESS_TOKEN, data.accessToken);
      await storage.setItem(KEYS.REFRESH_TOKEN, data.refreshToken);
      await storage.setItem(KEYS.USER, JSON.stringify(data.user));
      setState({ user: data.user, isLoggedIn: true, isLoading: false });
      return { success: true };
    } catch {
      return { success: false, error: "Erro de conexão. Tente novamente." };
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await storage.getItem(KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      fetch(`${domain}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    await clearTokens();
  }, []);

  const migrateAnonymousData = useCallback(async (anonymousDeviceId: string) => {
    const token = await getAccessToken();
    if (!token) return {};
    try {
      const res = await fetch(`${domain}/api/auth/migrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ anonymousDeviceId }),
      });
      if (res.ok) {
        const data = await res.json();
        return { newDeviceId: data.newDeviceId };
      }
    } catch {}
    return {};
  }, [getAccessToken]);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> ?? {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      await clearTokens();
    }
    return res;
  }, [getAccessToken]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, migrateAnonymousData, getAccessToken, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
