import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api";
import { AUTH_EXPIRED_EVENT, tokenStore } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token is stored we must verify it before deciding where to route.
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const startSession = useCallback(({ user, token }) => {
    tokenStore.set(token);
    setUser(user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (credentials) => startSession(await authApi.login(credentials)),
      register: async (data) => startSession(await authApi.register(data)),
      logout: () => {
        tokenStore.clear();
        setUser(null);
      },
    }),
    [user, loading, startSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
