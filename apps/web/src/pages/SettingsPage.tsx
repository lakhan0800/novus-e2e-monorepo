import { Button, Card, ErrorMessage, TextField } from "@fieldnotes/ui";
import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function SettingsPage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setError(null);
    try {
      setUser(await api.updateMe(name));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile");
    }
  };

  return (
    <>
      <h1>Settings</h1>
      <Card title="Profile">
        <form onSubmit={(event) => void save(event)}>
          <TextField
            id="profile-name-input"
            label="Display name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField id="profile-email-input" label="Email" value={user?.email ?? ""} disabled />
          <ErrorMessage message={error} />
          <Button id="save-profile-button" type="submit" disabled={!name.trim()}>
            Save profile
          </Button>
          {saved && <span className="fn-muted"> Saved.</span>}
        </form>
      </Card>
      <Card title="Organization">
        <p>
          {user?.organization.name} · {user?.organization.plan} plan
        </p>
      </Card>
    </>
  );
}
