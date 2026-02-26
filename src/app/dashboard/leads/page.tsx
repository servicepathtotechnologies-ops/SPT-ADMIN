"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchLeads } from "@/lib/api";
import type { LeadOrLostItem } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Mail, Calendar, Building2, Loader2 } from "lucide-react";

export default function LeadsPage() {
  const [data, setData] = useState<{ data: LeadOrLostItem[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLeads({ limit: 500 })
      .then((res) => setData({ data: res.data || [], total: res.total || 0 }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error === "UNAUTHORIZED") {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
        Session expired. Please <a href="/login" className="underline">sign in again</a>.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Contacts and demos marked as Lead · {data?.total ?? 0} total
        </p>
      </div>

      {error && error !== "UNAUTHORIZED" && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700/60 bg-slate-800/60 sticky top-0">
                <tr>
                  <th className="p-3 font-medium text-slate-300">Type</th>
                  <th className="p-3 font-medium text-slate-300">Contact</th>
                  <th className="p-3 font-medium text-slate-300 hidden sm:table-cell">Company</th>
                  <th className="p-3 font-medium text-slate-300">Status</th>
                  <th className="p-3 font-medium text-slate-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {(data?.data ?? []).map((row) => (
                  <tr key={`${row.entity_type}-${row.id}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        {row.entity_type === "contact" ? (
                          <Mail className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Calendar className="w-4 h-4 text-emerald-400" />
                        )}
                        {row.entity_type === "contact" ? "Contact" : "Demo"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <a
                          href={`mailto:${row.email}`}
                          className="text-blue-400 hover:underline font-medium"
                        >
                          {row.email}
                        </a>
                        <span className="text-slate-400 text-xs mt-0.5">{row.full_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 hidden sm:table-cell">
                      {row.company ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {row.company}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!data?.data?.length || data.data.length === 0) && (
            <p className="p-8 text-center text-slate-500">No leads yet. Mark contacts or demos as Lead to see them here.</p>
          )}
        </div>
      )}
    </div>
  );
}
