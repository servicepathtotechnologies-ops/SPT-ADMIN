"use client";

import { STATUS_BADGE_COLORS } from "@/lib/types";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const colors = STATUS_BADGE_COLORS[status] ?? { bg: "bg-slate-500/20", text: "text-slate-400" };
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClass} ${className}`}
    >
      {status}
    </span>
  );
}
