import React from "react";

export function AppSelect({ label, value, onChange, options = [] }) {
  return (
    <label className="label">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
export default AppSelect;
