import { randomUUID } from "node:crypto";

export type Role = "researcher" | "admin";
export type Plan = "free" | "team" | "enterprise";

export interface Organization {
  id: string;
  name: string;
  plan: Plan;
  billingEmail: string;
  seats: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  active: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  body: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  organizationId: string;
  ownerId: string;
  title: string;
  notes: Note[];
  sharedAt: string | null;
  updatedAt: string;
}

// Demo credentials for local development; every seeded user signs in with this password.
export const DEMO_PASSWORD = "fieldnotes";

const now = () => new Date().toISOString();

export const organizations = new Map<string, Organization>([
  [
    "org_fieldlab",
    {
      id: "org_fieldlab",
      name: "Field Lab",
      plan: "team",
      billingEmail: "billing@fieldlab.test",
      seats: 10,
    },
  ],
]);

export const users = new Map<string, User>(
  [
    {
      id: "user_grace",
      email: "grace@fieldlab.test",
      name: "Grace Hopper",
      role: "researcher" as const,
    },
    { id: "user_ada", email: "ada@fieldlab.test", name: "Ada Lovelace", role: "admin" as const },
    {
      id: "user_alan",
      email: "alan@fieldlab.test",
      name: "Alan Turing",
      role: "researcher" as const,
    },
  ].map((seed) => [
    seed.id,
    { ...seed, organizationId: "org_fieldlab", active: true, createdAt: now() },
  ])
);

export const notebooks = new Map<string, Notebook>();

export function createNotebook(owner: User, title: string): Notebook {
  const notebook: Notebook = {
    id: randomUUID(),
    organizationId: owner.organizationId,
    ownerId: owner.id,
    title,
    notes: [],
    sharedAt: null,
    updatedAt: now(),
  };
  notebooks.set(notebook.id, notebook);
  return notebook;
}

export function addNote(notebook: Notebook, body: string): Note {
  const note: Note = { id: randomUUID(), body, updatedAt: now() };
  notebook.notes.push(note);
  notebook.updatedAt = note.updatedAt;
  return note;
}

const grace = users.get("user_grace");
if (grace) {
  const wetlands = createNotebook(grace, "Wetlands survey");
  addNote(wetlands, "Counted 14 herons at the north pond before 7am.");
  addNote(wetlands, "Water level is 20cm lower than last month.");
  createNotebook(grace, "Soil samples");
}

export function findUserByEmail(email: string): User | undefined {
  return [...users.values()].find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function touch(): string {
  return now();
}
