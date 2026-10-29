import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Card({ title, actions, children }: CardProps) {
  return (
    <section className="fn-card">
      {(title || actions) && (
        <header className="fn-card__header">
          {title && <h2 className="fn-card__title">{title}</h2>}
          {actions && <div className="fn-card__actions">{actions}</div>}
        </header>
      )}
      <div className="fn-card__body">{children}</div>
    </section>
  );
}
