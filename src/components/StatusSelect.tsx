"use client";

import { CONTACT_STATUS_OPTIONS, DEMO_STATUS_OPTIONS } from "@/lib/types";

interface StatusSelectProps {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  variant?: "contact" | "demo";
}

export function StatusSelect({
  value,
  onChange,
  disabled,
  size = "md",
  variant = "contact",
}: StatusSelectProps) {
  const options = variant === "demo" ? DEMO_STATUS_OPTIONS : CONTACT_STATUS_OPTIONS;
  const base =
    "rounded border bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const sizeClass = size === "sm" ? "py-1 px-2 text-xs" : "py-2 px-3 text-sm";

  return (
    <select
      value={value || "Pending"}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${base} ${sizeClass} border-slate-600 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {options.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
