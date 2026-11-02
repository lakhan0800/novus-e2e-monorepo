import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore, type Profile } from "../api/client";

interface AuthState {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: Profile) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => tokenStore.get() !== null);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  // Identify the signed-in user with Pendo whenever their profile is set:
  // after sign-in, after session hydration via /auth/me, and after profile edits.
  useEffect(() => {
    if (!user) return;
    pendo.identify({
      visitor: {
        id: user.id,
        full_name: user.name,
        role: user.role,
        accountId: user.organization.id,
      },
      account: {
        id: user.organization.id,
        plan: user.organization.plan,
      },
    });
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { token, user: profile } = await api.login(email, password);
    tokenStore.set(token);
    setUser(profile);
  };

  const signOut = async () => {
    try {
      await api.logout();
    } finally {
      tokenStore.clear();
      setUser(null);
      // The install snippet does not stub clearSession; guard in case the agent has not loaded.
      pendo.clearSession?.();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
