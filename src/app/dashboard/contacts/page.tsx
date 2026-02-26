"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchContacts,
  updateContactStatus,
  deleteContact,
} from "@/lib/api";
import type { Contact, ContactsResponse } from "@/lib/types";
import { StatusSelect } from "@/components/StatusSelect";
import { useSocket } from "@/context/SocketContext";
import { Mail, Phone, Building2, Trash2, Download, Loader2 } from "lucide-react";

function escapeCsv(s: string) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

const STATUS_FILTER_OPTIONS = ["All", "Pending", "Processing", "Contacted", "Qualified", "Lead", "Lost"];

export default function ContactsPage() {
  const [data, setData] = useState<ContactsResponse | null>(null);
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
    fetchContacts(params)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubNew = socket.onNewContact((contact) => {
      setData((prev) => {
        if (!prev) return prev;
        if (prev.data.some((c) => c.id === contact.id)) return prev;
        return {
          ...prev,
          data: [contact, ...prev.data],
          total: prev.total + 1,
          count: prev.data.length + 1,
        };
      });
    });
    const unsubUpdated = socket.onContactStatusUpdated((contact) => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((c) => (c.id === contact.id ? { ...c, status: contact.status } : c)),
            }
          : null
      );
    });
    return () => {
      unsubNew();
      unsubUpdated();
    };
  }, [socket]);

  async function handleStatusChange(contact: Contact, newStatus: string) {
    if (contact.status === newStatus) return;
    setUpdatingId(contact.id);
    try {
      await updateContactStatus(contact.id, newStatus);
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((c) =>
                c.id === contact.id ? { ...c, status: newStatus } : c
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

  async function handleDelete(contact: Contact) {
    if (!confirm(`Delete contact from ${contact.email}?`)) return;
    setDeletingId(contact.id);
    try {
      await deleteContact(contact.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.filter((c) => c.id !== contact.id),
              total: Math.max(0, prev.total - 1),
              count: prev.data.filter((c) => c.id !== contact.id).length,
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
    const headers = ["Email", "Name", "Phone", "Company", "Message", "Status", "Created"];
    const rows = data.data.map((c) => [
      c.email,
      c.full_name,
      c.phone ?? "",
      c.company ?? "",
      c.message,
      c.status || "Pending",
      new Date(c.created_at).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
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
            <h1 className="text-2xl font-bold text-white">Contacts</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Contact form submissions · {data?.total ?? 0} total
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
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 text-slate-200 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="To"
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
                  <th className="p-3 font-medium text-slate-300">Status</th>
                  <th className="p-3 font-medium text-slate-300">Date</th>
                  <th className="p-3 font-medium text-slate-300 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {(data?.data ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <a
                          href={`mailto:${c.email}`}
                          className="text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {c.email}
                        </a>
                        <span className="text-slate-400 text-xs mt-0.5">
                          {c.full_name}
                          {c.phone && (
                            <span className="inline-flex items-center gap-1 ml-2">
                              <Phone className="w-3 h-3" />
                              {c.phone}
                            </span>
                          )}
                        </span>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2 max-w-md">
                          {c.message}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 hidden sm:table-cell">
                      {c.company ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {c.company}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      <StatusSelect
                        value={c.status || "Pending"}
                        onChange={(s) => handleStatusChange(c, s)}
                        disabled={updatingId === c.id}
                        size="sm"
                        variant="contact"
                      />
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50 p-1.5 rounded transition-colors"
                        title="Delete"
                      >
                        {deletingId === c.id ? (
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
            <p className="p-8 text-center text-slate-500">No contacts yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
