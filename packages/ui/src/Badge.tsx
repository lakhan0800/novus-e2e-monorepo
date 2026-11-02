import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`fn-badge fn-badge--${tone}`}>{children}</span>;
}
