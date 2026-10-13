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
    const notebook = (await response.json()) as Notebook;
    setNotebooks([notebook, ...notebooks]);
    setTitle("");
    // Track only server-confirmed creations. `title` and `notebooks` still hold this
    // submission's values here; send the title's length rather than its free text.
    if (response.ok && typeof pendo !== "undefined") {
      pendo.track("notebook_created", {
        notebookId: notebook.id,
        titleLength: title.trim().length,
        notebookCount: notebooks.length + 1,
      });
    }
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
    const note = (await response.json()) as Note;
    setNotes([...notes, note]);
    setBody("");
    // Track only server-confirmed saves. `body` and `notes` still hold this submission's
    // values here; send the note's length rather than its free text.
    if (response.ok && typeof pendo !== "undefined") {
      pendo.track("note_created", {
        notebookId,
        noteId: note.id,
        bodyLength: body.trim().length,
        noteCount: notes.length + 1,
      });
    }
  };

  const share = async () => {
    const response = await fetch(`/api/notebooks/${notebookId}/share`, { method: "POST" });
    // The button click is auto-captured; this records only shares the server confirmed.
    if (response.ok && typeof pendo !== "undefined") {
      pendo.track("notebook_shared", {
        notebookId,
        noteCount: notes.length,
      });
    }
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
      .then(setResearcher);
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
