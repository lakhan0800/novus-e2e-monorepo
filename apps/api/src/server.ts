import express from "express";
import { randomUUID } from "node:crypto";

interface Notebook {
  id: string;
  title: string;
  notes: { id: string; body: string }[];
}

const notebooks = new Map<string, Notebook>();
const app = express();
app.use(express.json());

app.get("/api/me", (_req, res) => {
  res.json({
    id: "researcher_1",
    email: "grace@fieldlab.test",
    organizationId: "org_1",
    organizationName: "Field Lab",
  });
});

app.get("/api/notebooks", (_req, res) => {
  res.json([...notebooks.values()].map(({ id, title }) => ({ id, title })));
});

app.post("/api/notebooks", (req, res) => {
  const notebook = { id: randomUUID(), title: String(req.body.title ?? "Untitled"), notes: [] };
  notebooks.set(notebook.id, notebook);
  res.status(201).json({ id: notebook.id, title: notebook.title });
});

app.get("/api/notebooks/:id/notes", (req, res) => {
  res.json(notebooks.get(req.params.id)?.notes ?? []);
});

app.post("/api/notebooks/:id/notes", (req, res) => {
  const notebook = notebooks.get(req.params.id);
  if (!notebook) {
    res.status(404).json({ error: "Notebook not found" });
    return;
  }
  const note = { id: randomUUID(), body: String(req.body.body ?? "") };
  notebook.notes.push(note);
  res.status(201).json(note);
});

app.post("/api/notebooks/:id/share", (req, res) => {
  res.json({ shareUrl: `https://fieldnotes.test/s/${req.params.id}` });
});

app.listen(5000, () => {
  console.log("Fieldnotes API listening on :5000");
});
