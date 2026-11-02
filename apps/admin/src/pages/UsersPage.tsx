import { Badge, Button, Card, DataTable, ErrorMessage, type Column } from "@fieldnotes/ui";
import { useEffect, useState } from "react";
import { adminApi, type Member, type Role } from "../api/client";
import { useAdminAuth } from "../auth/AdminAuthContext";

export function UsersPage() {
  const { admin } = useAdminAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listMembers()
      .then(setMembers)
      .catch((err: Error) => setError(err.message));
  }, []);

  const update = async (member: Member, changes: { role?: Role; active?: boolean }) => {
    setError(null);
    try {
      const updated = await adminApi.updateMember(member.id, changes);
      setMembers(members.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the user");
    }
  };

  const columns: Column<Member>[] = [
    { key: "name", header: "Name", render: (member) => member.name },
    { key: "email", header: "Email", render: (member) => member.email },
    {
      key: "role",
      header: "Role",
      render: (member) => (
        <select
          aria-label={`Role for ${member.name}`}
          value={member.role}
          disabled={member.id === admin?.id}
          onChange={(event) => void update(member, { role: event.target.value as Role })}
        >
          <option value="researcher">Researcher</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (member) =>
        member.active ? (
          <Badge tone="success">Active</Badge>
        ) : (
          <Badge tone="warning">Deactivated</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (member) =>
        member.id === admin?.id ? null : (
          <Button
            variant={member.active ? "danger" : "secondary"}
            onClick={() => void update(member, { active: !member.active })}
          >
            {member.active ? "Deactivate" : "Reactivate"}
          </Button>
        ),
    },
  ];

  return (
    <>
      <h1>Users</h1>
      <ErrorMessage message={error} />
      <Card title={`${members.length} members`}>
        <DataTable columns={columns} rows={members} rowKey={(member) => member.id} />
      </Card>
    </>
  );
}
