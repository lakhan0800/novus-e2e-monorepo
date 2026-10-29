import { Router, type Request, type Response } from "express";
import { requireAdmin, requireAuth, type AuthedLocals } from "../auth.js";
import { users, type Plan, type Role } from "../store.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

type Res = Response<unknown, AuthedLocals>;

const ROLES: Role[] = ["researcher", "admin"];
const PLANS: Plan[] = ["free", "team", "enterprise"];

adminRouter.get("/users", (_req, res: Res) => {
  const members = [...users.values()]
    .filter((user) => user.organizationId === res.locals.organization.id)
    .map(({ id, email, name, role, active, createdAt }) => ({
      id,
      email,
      name,
      role,
      active,
      createdAt,
    }));
  res.json(members);
});

adminRouter.patch("/users/:id", (req: Request<{ id: string }>, res: Res) => {
  const user = users.get(req.params.id);
  if (!user || user.organizationId !== res.locals.organization.id) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { role, active } = req.body ?? {};
  if (role !== undefined) {
    if (!ROLES.includes(role)) {
      res.status(400).json({ error: `role must be one of ${ROLES.join(", ")}` });
      return;
    }
    user.role = role;
  }
  if (active !== undefined) {
    if (typeof active !== "boolean") {
      res.status(400).json({ error: "active must be true or false" });
      return;
    }
    if (!active && user.id === res.locals.user.id) {
      res.status(400).json({ error: "You cannot deactivate yourself" });
      return;
    }
    user.active = active;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
  });
});

adminRouter.get("/billing", (_req, res: Res) => {
  const { plan, billingEmail, seats } = res.locals.organization;
  res.json({ plan, billingEmail, seats });
});

adminRouter.put("/billing", (req, res: Res) => {
  const { plan, billingEmail, seats } = req.body ?? {};
  if (!PLANS.includes(plan)) {
    res.status(400).json({ error: `plan must be one of ${PLANS.join(", ")}` });
    return;
  }
  if (typeof billingEmail !== "string" || !billingEmail.includes("@")) {
    res.status(400).json({ error: "billingEmail must be an email address" });
    return;
  }
  if (!Number.isInteger(seats) || seats < 1) {
    res.status(400).json({ error: "seats must be a whole number of at least 1" });
    return;
  }
  const organization = res.locals.organization;
  organization.plan = plan;
  organization.billingEmail = billingEmail;
  organization.seats = seats;
  res.json({ plan, billingEmail, seats });
});
