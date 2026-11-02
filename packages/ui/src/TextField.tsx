import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export function TextField({ id, label, ...props }: TextFieldProps) {
  return (
    <label className="fn-field" htmlFor={id}>
      <span className="fn-field__label">{label}</span>
      <input id={id} className="fn-field__input" {...props} />
    </label>
  );
}
