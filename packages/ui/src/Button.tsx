import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  const classes = ["fn-button", `fn-button--${variant}`, className].filter(Boolean).join(" ");
  return <button type={type} className={classes} {...props} />;
}
