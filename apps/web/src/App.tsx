import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Route, Routes, useParams } from "react-router-dom";

interface Notebook {
  id: string;
  title: string;
}

interface Note {
  id: string;
  body: string;
}

interface Researcher {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
}

function NotebooksPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    void fetch("/api/notebooks")
      .then((response) => response.json())
      .then(setNotebooks);
  }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/notebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setNotebooks([(await response.json()) as Notebook, ...notebooks]);
    setTitle("");
  };

  return (
    <section>
      <h1>Notebooks</h1>
      <form onSubmit={(event) => void create(event)}>
        <input id="notebook-title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button id="create-notebook-button" type="submit">
          New notebook
        </button>
      </form>
      <ul>
        {notebooks.map((notebook) => (
          <li key={notebook.id}>
            <Link to={`/notebooks/${notebook.id}`}>{notebook.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NotebookPage() {
  const { notebookId } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    void fetch(`/api/notebooks/${notebookId}/notes`)
      .then((response) => response.json())
      .then(setNotes);
  }, [notebookId]);

  const addNote = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch(`/api/notebooks/${notebookId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setNotes([...notes, (await response.json()) as Note]);
    setBody("");
  };

  const share = async () => {
    await fetch(`/api/notebooks/${notebookId}/share`, { method: "POST" });
  };

  return (
    <section>
      <button id="share-notebook-button" type="button" onClick={() => void share()}>
        Share notebook
      </button>
      <form onSubmit={(event) => void addNote(event)}>
        <textarea id="note-body-input" value={body} onChange={(e) => setBody(e.target.value)} />
        <button id="save-note-button" type="submit">
          Save note
        </button>
      </form>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.body}</li>
        ))}
      </ul>
    </section>
  );
}

export function App() {
  const [researcher, setResearcher] = useState<Researcher | null>(null);

  useEffect(() => {
    void fetch("/api/me")
      .then((response) => response.json())
      .then((data: Researcher) => {
        setResearcher(data);
        pendo.identify({
          visitor: {
            id: data.id,
            email: data.email,
            organizationId: data.organizationId,
          },
          account: {
            id: data.organizationId,
            name: data.organizationName,
          },
        });
      });
  }, []);

  return (
    <div>
      <nav>
        <NavLink to="/">Notebooks</NavLink>
        <span>{researcher?.organizationName}</span>
        <span>{researcher?.email}</span>
      </nav>
      <Routes>
        <Route path="/" element={<NotebooksPage />} />
        <Route path="/notebooks/:notebookId" element={<NotebookPage />} />
      </Routes>
    </div>
  );
}
