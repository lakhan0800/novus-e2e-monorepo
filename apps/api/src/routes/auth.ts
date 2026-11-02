import { Router, type Response } from "express";
import { endSession, requireAuth, startSession, toProfile, type AuthedLocals } from "../auth.js";
import { DEMO_PASSWORD, findUserByEmail, organizations } from "../store.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const email = String(req.body?.email ?? "");
  const password = String(req.body?.password ?? "");
  const user = findUserByEmail(email);
  const organization = user ? organizations.get(user.organizationId) : undefined;
  if (!user || !organization || !user.active || password !== DEMO_PASSWORD) {
    res.status(401).json({ error: "Wrong email or password" });
    return;
  }
  res.json({ token: startSession(user), user: toProfile(user, organization) });
});

authRouter.post("/logout", requireAuth, (_req, res: Response<unknown, AuthedLocals>) => {
  endSession(res.locals.token);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, (_req, res: Response<unknown, AuthedLocals>) => {
  res.json(toProfile(res.locals.user, res.locals.organization));
});

authRouter.patch("/me", requireAuth, (req, res: Response<unknown, AuthedLocals>) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  res.locals.user.name = name;
  res.json(toProfile(res.locals.user, res.locals.organization));
});
