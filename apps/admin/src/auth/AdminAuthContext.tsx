import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { trackEvent } from "../analytics/pendo";
import { adminApi, tokenStore, type AdminProfile } from "../api/client";

interface AdminAuthState {
  admin: AdminProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(() => tokenStore.get() !== null);

  useEffect(() => {
    if (!tokenStore.get()) return;
    adminApi
      .me()
      .then((profile) => {
        if (profile.role === "admin") setAdmin(profile);
        else tokenStore.clear();
      })
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    let session: Awaited<ReturnType<typeof adminApi.login>>;
    try {
      session = await adminApi.login(email, password);
    } catch (err) {
      // Admin sign-in attempt finished: the API rejected the credentials.
      trackEvent("admin_sign_in_completed", {
        outcome: "failure",
        failure_reason: "credentials_rejected",
      });
      throw err;
    }
    const { token, user } = session;
    if (user.role !== "admin") {
      tokenStore.set(token);
      await adminApi.logout().catch(() => undefined);
      tokenStore.clear();
      // Admin sign-in attempt finished: the user is not an organization admin.
      trackEvent("admin_sign_in_completed", {
        outcome: "failure",
        failure_reason: "not_organization_admin",
        user_role: user.role,
        organization_id: user.organization.id,
        organization_plan: user.organization.plan,
      });
      throw new Error("This portal is for organization admins only");
    }
    tokenStore.set(token);
    setAdmin(user);
    // Admin sign-in attempt finished successfully (fresh login, not a restored session).
    trackEvent("admin_sign_in_completed", {
      outcome: "success",
      user_role: user.role,
      organization_id: user.organization.id,
      organization_plan: user.organization.plan,
    });
  };

  const signOut = async () => {
    try {
      await adminApi.logout();
    } finally {
      tokenStore.clear();
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return context;
}
