import type { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

export function SelectField({ id, label, options, ...props }: SelectFieldProps) {
  return (
    <label className="fn-field" htmlFor={id}>
      <span className="fn-field__label">{label}</span>
      <select id={id} className="fn-field__input" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
