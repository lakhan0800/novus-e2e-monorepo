import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { trackEvent } from "../analytics/trackEvent";
import { api, tokenStore, type Profile } from "../api/client";

// Module-level guard so "Session restored" fires once per page load, even when
// StrictMode runs the restore effect twice or the provider remounts.
let sessionRestoreTracked = false;

function profileProperties(profile: Profile) {
  return {
    user_role: profile.role,
    organization_plan: profile.organization.plan,
  };
}

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
      .then((profile) => {
        setUser(profile);
        // A saved token was accepted and the profile loaded, so the login form is skipped.
        if (!sessionRestoreTracked) {
          sessionRestoreTracked = true;
          trackEvent("Session restored", profileProperties(profile));
        }
      })
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const { token, user: profile } = await api.login(email, password);
    tokenStore.set(token);
    setUser(profile);
    // Credentials accepted, token stored and profile loaded.
    trackEvent("Signed in", profileProperties(profile));
  };

  const signOut = async () => {
    try {
      await api.logout();
    } finally {
      tokenStore.clear();
      setUser(null);
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
