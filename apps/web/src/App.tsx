import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { AssistantPanel } from "./components/AssistantPanel";
import { NavBar } from "./components/NavBar";
import { LoginPage } from "./pages/LoginPage";
import { NotebookPage } from "./pages/NotebookPage";
import { NotebooksPage } from "./pages/NotebooksPage";
import { SettingsPage } from "./pages/SettingsPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="fn-main">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return (
    <>
      <NavBar />
      <div className="fn-layout">
        <main className="fn-main">{children}</main>
        <AssistantPanel />
      </div>
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <NotebooksPage />
          </RequireAuth>
        }
      />
      <Route
        path="/notebooks/:notebookId"
        element={
          <RequireAuth>
            <NotebookPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
