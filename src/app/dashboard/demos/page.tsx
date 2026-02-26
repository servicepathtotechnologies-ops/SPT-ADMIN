"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchDemos,
  updateDemoStatus,
  deleteDemo,
} from "@/lib/api";
import type { Demo, DemosResponse } from "@/lib/types";
import { StatusSelect } from "@/components/StatusSelect";
import { useSocket } from "@/context/SocketContext";
import { Mail, Calendar, Building2, Trash2, Download, Loader2 } from "lucide-react";

function escapeCsv(s: string) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

const STATUS_FILTER_OPTIONS = ["All", "Pending", "Scheduled", "Completed", "Cancelled", "Lead", "Lost"];

export default function DemosPage() {
  const [data, setData] = useState<DemosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const socket = useSocket();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: { limit: number; status?: string; dateFrom?: string; dateTo?: string; search?: string } = {
      limit: 500,
    };
    if (statusFilter && statusFilter !== "All") params.status = statusFilter;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (search.trim()) params.search = search.trim();
    fetchDemos(params)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubNew = socket.onNewDemo((demo) => {
      setData((prev) => {
        if (!prev) return prev;
        if (prev.data.some((d) => d.id === demo.id)) return prev;
        return {
          ...prev,
          data: [demo, ...prev.data],
          total: prev.total + 1,
          count: prev.data.length + 1,
        };
      });
    });
    const unsubUpdated = socket.onDemoStatusUpdated((demo) => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((d) => (d.id === demo.id ? { ...d, status: demo.status } : d)),
            }
          : null
      );
    });
    return () => {
      unsubNew();
      unsubUpdated();
    };
  }, [socket]);

  async function handleStatusChange(demo: Demo, newStatus: string) {
    if (demo.status === newStatus) return;
    setUpdatingId(demo.id);
    try {
      await updateDemoStatus(demo.id, newStatus);
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((d) =>
                d.id === demo.id ? { ...d, status: newStatus } : d
              ),
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(demo: Demo) {
    if (!confirm(`Delete demo request from ${demo.email}?`)) return;
    setDeletingId(demo.id);
    try {
      await deleteDemo(demo.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.filter((d) => d.id !== demo.id),
              total: Math.max(0, prev.total - 1),
              count: prev.data.filter((d) => d.id !== demo.id).length,
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function exportCsv() {
    if (!data?.data?.length) return;
    const headers = ["Email", "Name", "Company", "Demo date", "Service", "Notes", "Status", "Created"];
    const rows = data.data.map((d) => [
      d.email,
      d.full_name,
      d.company ?? "",
      new Date(d.demo_date).toISOString(),
      d.service ?? "",
      d.notes ?? "",
      d.status || "Pending",
      new Date(d.created_at).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error === "UNAUTHORIZED") {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
        Session expired. Please <a href="/login" className="underline">sign in again</a>.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Demos</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Demo booking requests · {data?.total ?? 0} total
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!data?.data?.length}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate-700/60 bg-slate-900/40">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 text-slate-200 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_FILTER_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 text-slate-200 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 text-slate-200 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email..."
            className="rounded border border-slate-600 bg-slate-800 text-slate-200 text-sm py-2 px-3 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      {error && error !== "UNAUTHORIZED" && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700/60 bg-slate-800/60 sticky top-0">
                <tr>
                  <th className="p-3 font-medium text-slate-300">Contact</th>
                  <th className="p-3 font-medium text-slate-300 hidden sm:table-cell">Company</th>
                  <th className="p-3 font-medium text-slate-300">Demo date</th>
                  <th className="p-3 font-medium text-slate-300 hidden md:table-cell">Service</th>
                  <th className="p-3 font-medium text-slate-300">Status</th>
                  <th className="p-3 font-medium text-slate-300 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {(data?.data ?? []).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <a
                          href={`mailto:${d.email}`}
                          className="text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {d.email}
                        </a>
                        <span className="text-slate-400 text-xs mt-0.5">
                          {d.full_name}
                        </span>
                        {d.notes && (
                          <p className="text-slate-500 text-xs mt-1 line-clamp-2 max-w-xs">
                            {d.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 hidden sm:table-cell">
                      {d.company ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {d.company}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(d.demo_date).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 hidden md:table-cell">
                      {d.service ?? "—"}
                    </td>
                    <td className="p-3">
                      <StatusSelect
                        value={d.status || "Pending"}
                        onChange={(s) => handleStatusChange(d, s)}
                        disabled={updatingId === d.id}
                        size="sm"
                        variant="demo"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(d)}
                        disabled={deletingId === d.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50 p-1.5 rounded transition-colors"
                        title="Delete"
                      >
                        {deletingId === d.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!data?.data?.length || data.data.length === 0) && (
            <p className="p-8 text-center text-slate-500">No demo requests yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
