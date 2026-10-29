import express from "express";
import { adminRouter } from "./routes/admin.js";
import { assistantRouter } from "./routes/assistant.js";
import { authRouter } from "./routes/auth.js";
import { notebooksRouter } from "./routes/notebooks.js";

const port = Number(process.env.PORT ?? 5000);

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/auth", authRouter);
app.use("/api/notebooks", notebooksRouter);
app.use("/api/assistant", assistantRouter);
app.use("/api/admin", adminRouter);

app.listen(port, () => {
  console.log(`Fieldnotes API listening on :${port}`);
});
