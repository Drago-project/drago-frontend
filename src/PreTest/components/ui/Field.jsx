import React from "react";

export function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  min,
  max,
  maxLength = 50,
}) {
  return (
    <label className="label">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        min={min}
        max={max}
        maxLength={maxLength}
      />
    </label>
  );
}
export default Field;
