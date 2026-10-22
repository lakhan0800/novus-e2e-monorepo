import type { TextareaHTMLAttributes } from "react";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
}

export function TextAreaField({ id, label, ...props }: TextAreaFieldProps) {
  return (
    <label className="fn-field" htmlFor={id}>
      <span className="fn-field__label">{label}</span>
      <textarea id={id} className="fn-field__input" rows={4} {...props} />
    </label>
  );
}
