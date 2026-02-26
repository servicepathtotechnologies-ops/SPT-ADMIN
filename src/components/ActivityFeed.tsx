"use client";

import { useEffect, useState } from "react";
import { fetchActivity } from "@/lib/api";
import type { ActivityItem } from "@/lib/types";
import { Mail, Calendar, Loader2 } from "lucide-react";

function formatTime(updated_at: string) {
  const d = new Date(updated_at);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function message(item: ActivityItem): string {
  const name = item.full_name || "Someone";
  const entityLabel = item.entity_type === "contact" ? "contact" : "demo";
  if (item.old_status == null) {
    return `New ${entityLabel} from ${name}`;
  }
  return `${name} marked as ${item.new_status}`;
}

export function ActivityFeed({ limit = 20 }: { limit?: number }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity({ limit })
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-400 py-4">
        {error === "UNAUTHORIZED" ? "Session expired." : error}
      </p>
    );
  }

  if (!items.length) {
    return (
      <p className="text-sm text-slate-500 py-4">No activity yet.</p>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="flex gap-3 py-3 border-b border-slate-700/40 last:border-0 animate-in fade-in duration-200"
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center">
            {item.entity_type === "contact" ? (
              <Mail className="w-4 h-4 text-cyan-400" />
            ) : (
              <Calendar className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200">{message(item)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatTime(item.updated_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
