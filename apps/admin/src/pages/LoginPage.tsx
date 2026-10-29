import { Button, Card, ErrorMessage, TextField } from "@fieldnotes/ui";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/AdminAuthContext";

export function LoginPage() {
  const { admin, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (admin) return <Navigate to="/users" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate("/users", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="fn-main">
      <Card title="Fieldnotes Admin sign in">
        <form onSubmit={(event) => void submit(event)}>
          <TextField
            id="admin-login-email-input"
            label="Admin email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            id="admin-login-password-input"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <ErrorMessage message={error} />
          <Button id="admin-login-submit-button" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
