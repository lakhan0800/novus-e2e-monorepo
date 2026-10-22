import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedLocals } from "../auth.js";
import { addNote, createNotebook, notebooks, touch, type Notebook } from "../store.js";

export const notebooksRouter = Router();
notebooksRouter.use(requireAuth);

type Res = Response<unknown, AuthedLocals>;

function summary(notebook: Notebook) {
  return {
    id: notebook.id,
    title: notebook.title,
    noteCount: notebook.notes.length,
    shared: notebook.sharedAt !== null,
    updatedAt: notebook.updatedAt,
  };
}

function findOwned(req: Request<{ id: string }>, res: Res): Notebook | undefined {
  const notebook = notebooks.get(req.params.id);
  if (!notebook || notebook.organizationId !== res.locals.organization.id) {
    res.status(404).json({ error: "Notebook not found" });
    return undefined;
  }
  return notebook;
}

notebooksRouter.get("/", (_req, res: Res) => {
  const mine = [...notebooks.values()]
    .filter((notebook) => notebook.organizationId === res.locals.organization.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json(mine.map(summary));
});

notebooksRouter.post("/", (req, res: Res) => {
  const title = String(req.body?.title ?? "").trim();
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  res.status(201).json(summary(createNotebook(res.locals.user, title)));
});

notebooksRouter.get("/:id", (req: Request<{ id: string }>, res: Res) => {
  const notebook = findOwned(req, res);
  if (notebook) res.json({ ...summary(notebook), notes: notebook.notes });
});

notebooksRouter.patch("/:id", (req: Request<{ id: string }>, res: Res) => {
  const notebook = findOwned(req, res);
  if (!notebook) return;
  const title = String(req.body?.title ?? "").trim();
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  notebook.title = title;
  notebook.updatedAt = touch();
  res.json(summary(notebook));
});

notebooksRouter.delete("/:id", (req: Request<{ id: string }>, res: Res) => {
  const notebook = findOwned(req, res);
  if (!notebook) return;
  notebooks.delete(notebook.id);
  res.status(204).end();
});

notebooksRouter.post("/:id/notes", (req: Request<{ id: string }>, res: Res) => {
  const notebook = findOwned(req, res);
  if (!notebook) return;
  const body = String(req.body?.body ?? "").trim();
  if (!body) {
    res.status(400).json({ error: "Note body is required" });
    return;
  }
  res.status(201).json(addNote(notebook, body));
});

notebooksRouter.patch(
  "/:id/notes/:noteId",
  (req: Request<{ id: string; noteId: string }>, res: Res) => {
    const notebook = findOwned(req, res);
    if (!notebook) return;
    const note = notebook.notes.find((candidate) => candidate.id === req.params.noteId);
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    const body = String(req.body?.body ?? "").trim();
    if (!body) {
      res.status(400).json({ error: "Note body is required" });
      return;
    }
    note.body = body;
    note.updatedAt = touch();
    notebook.updatedAt = note.updatedAt;
    res.json(note);
  }
);

notebooksRouter.post("/:id/share", (req: Request<{ id: string }>, res: Res) => {
  const notebook = findOwned(req, res);
  if (!notebook) return;
  notebook.sharedAt = touch();
  res.json({ shareUrl: `https://fieldnotes.test/s/${notebook.id}` });
});
