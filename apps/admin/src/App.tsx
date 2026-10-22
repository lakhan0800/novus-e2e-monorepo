import { Button } from "@fieldnotes/ui";
import type { ReactNode } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAdminAuth } from "./auth/AdminAuthContext";
import { BillingPage } from "./pages/BillingPage";
import { LoginPage } from "./pages/LoginPage";
import { UsersPage } from "./pages/UsersPage";

function AdminShell({ children }: { children: ReactNode }) {
  const { admin, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  if (loading) return <p className="fn-main">Loading…</p>;
  if (!admin) return <Navigate to="/login" replace />;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <>
      <nav className="fn-nav">
        <strong>Fieldnotes Admin</strong>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/billing">Billing</NavLink>
        <span className="fn-nav__spacer" />
        <span>
          {admin.name} · {admin.organization.name}
        </span>
        <Button id="admin-sign-out-button" variant="secondary" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </nav>
      <main className="fn-main">{children}</main>
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/users"
        element={
          <AdminShell>
            <UsersPage />
          </AdminShell>
        }
      />
      <Route
        path="/billing"
        element={
          <AdminShell>
            <BillingPage />
          </AdminShell>
        }
      />
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}
