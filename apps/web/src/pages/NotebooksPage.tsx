import {
  Badge,
  Button,
  Card,
  DataTable,
  ErrorMessage,
  TextField,
  type Column,
} from "@fieldnotes/ui";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, type NotebookSummary } from "../api/client";

const columns: Column<NotebookSummary>[] = [
  {
    key: "title",
    header: "Notebook",
    render: (notebook) => <Link to={`/notebooks/${notebook.id}`}>{notebook.title}</Link>,
  },
  { key: "notes", header: "Notes", render: (notebook) => notebook.noteCount },
  {
    key: "shared",
    header: "Sharing",
    render: (notebook) =>
      notebook.shared ? <Badge tone="success">Shared</Badge> : <Badge>Private</Badge>,
  },
  {
    key: "updated",
    header: "Last updated",
    render: (notebook) => new Date(notebook.updatedAt).toLocaleString(),
  },
];

export function NotebooksPage() {
  const [notebooks, setNotebooks] = useState<NotebookSummary[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listNotebooks()
      .then(setNotebooks)
      .catch((err: Error) => setError(err.message));
  }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const notebook = await api.createNotebook(title);
      setNotebooks([notebook, ...notebooks]);
      setTitle("");

      // Track successful notebook creation
      if (typeof pendo !== "undefined") {
        pendo.track("notebook_created", { title: notebook.title });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the notebook");
    }
  };

  return (
    <>
      <h1>Notebooks</h1>
      <Card title="New notebook">
        <form onSubmit={(event) => void create(event)}>
          <TextField
            id="notebook-title-input"
            label="Title"
            placeholder="e.g. Coastal birds, spring"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Button id="create-notebook-button" type="submit" disabled={!title.trim()}>
            Create notebook
          </Button>
        </form>
      </Card>
      <ErrorMessage message={error} />
      <Card title="Your notebooks">
        <DataTable
          columns={columns}
          rows={notebooks}
          rowKey={(notebook) => notebook.id}
          emptyText="No notebooks yet. Create your first one above."
        />
      </Card>
    </>
  );
}
