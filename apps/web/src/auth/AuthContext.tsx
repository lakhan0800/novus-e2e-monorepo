import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { trackEvent } from "../analytics/trackEvents";
import { api, tokenStore, type Profile } from "../api/client";

interface AuthState {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: Profile) => void;
}

const AuthContext = createContext<AuthState | null>(null);

// Module-level guard so a restored session is reported once per page load, even when
// React StrictMode runs the restore effect twice or the provider remounts.
let sessionRestoreTracked = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => tokenStore.get() !== null);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .me()
      .then((profile) => {
        setUser(profile);
        // Stored token accepted by /auth/me: the user is signed back in without the login form.
        if (!sessionRestoreTracked) {
          sessionRestoreTracked = true;
          trackEvent("Session restored", {
            user_role: profile.role,
            organization_plan: profile.organization.plan,
          });
        }
      })
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const { token, user: profile } = await api.login(email, password);
    tokenStore.set(token);
    setUser(profile);
    // Credentials accepted and session token stored: a successful login, not just an attempt.
    trackEvent("Signed in", {
      user_role: profile.role,
      organization_plan: profile.organization.plan,
    });
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
