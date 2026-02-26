"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Mail,
  Calendar,
  Target,
  XCircle,
  ArrowRight,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { fetchContacts, fetchDemos } from "@/lib/api";
import type { ContactsResponse, DemosResponse } from "@/lib/types";
import { ActivityFeed } from "@/components/ActivityFeed";
import { StatusBadge } from "@/components/StatusBadge";

const CHART_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Processing: "#3b82f6",
  Contacted: "#06b6d4",
  Qualified: "#10b981",
  Lead: "#8b5cf6",
  Lost: "#ef4444",
  Scheduled: "#3b82f6",
  Completed: "#10b981",
  Cancelled: "#64748b",
};

function StatusPieChart({ contacts, demos }: { contacts: ContactsResponse | null; demos: DemosResponse | null }) {
  const statusCounts: Record<string, number> = {};
  const add = (s: string) => {
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  };
  contacts?.data?.forEach((c) => add(c.status || "Pending"));
  demos?.data?.forEach((d) => add(d.status || "Pending"));
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const data = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  if (total === 0) {
    return (
      <p className="text-sm text-slate-500 py-4">No data for chart yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[entry.name] ?? "#64748b"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
          labelStyle={{ color: "#e2e8f0" }}
          formatter={(value: number) => [value, "Count"]}
          labelFormatter={(name) => name}
        />
        <Legend
          formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function DashboardOverview() {
  const [contacts, setContacts] = useState<ContactsResponse | null>(null);
  const [demos, setDemos] = useState<DemosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchContacts({ limit: 500 }),
      fetchDemos({ limit: 500 }),
    ])
      .then(([c, d]) => {
        if (!cancelled) {
          setContacts(c);
          setDemos(d);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
        {error === "UNAUTHORIZED" ? (
          <p>
            Session expired. <Link href="/login" className="underline">Sign in again</Link>.
          </p>
        ) : (
          <p>{error}</p>
        )}
      </div>
    );
  }

  const totalContacts = contacts?.total ?? 0;
  const totalDemos = demos?.total ?? 0;
  const pendingContacts = contacts?.data?.filter((c) => (c.status || "Pending") === "Pending").length ?? 0;
  const pendingDemos = demos?.data?.filter((d) => (d.status || "Pending") === "Pending").length ?? 0;
  const leadContacts = contacts?.data?.filter((c) => c.status === "Lead").length ?? 0;
  const leadDemos = demos?.data?.filter((d) => d.status === "Lead").length ?? 0;
  const lostContacts = contacts?.data?.filter((c) => c.status === "Lost").length ?? 0;
  const lostDemos = demos?.data?.filter((d) => d.status === "Lost").length ?? 0;
  const processingCount = contacts?.data?.filter((c) => c.status === "Processing").length ?? 0;
  const qualifiedContacts = contacts?.data?.filter((c) => c.status === "Qualified").length ?? 0;
  const qualifiedDemos = demos?.data?.filter((d) => d.status === "Qualified").length ?? 0;
  const totalLeads = leadContacts + leadDemos;
  const totalLost = lostContacts + lostDemos;

  const cards = [
    {
      title: "Total Contacts",
      value: totalContacts,
      sub: `${pendingContacts} pending`,
      icon: Mail,
      href: "/dashboard/contacts",
      color: "blue",
    },
    {
      title: "Total Demos",
      value: totalDemos,
      sub: `${pendingDemos} pending`,
      icon: Calendar,
      href: "/dashboard/demos",
      color: "emerald",
    },
    {
      title: "Pending",
      value: pendingContacts + pendingDemos,
      sub: "Awaiting action",
      icon: Mail,
      href: "/dashboard/contacts?status=Pending",
      color: "amber",
    },
    {
      title: "Processing",
      value: processingCount,
      sub: "Contacts in progress",
      icon: TrendingUp,
      href: "/dashboard/contacts",
      color: "blue",
    },
    {
      title: "Qualified",
      value: qualifiedContacts + qualifiedDemos,
      sub: "Contacts + Demos",
      icon: Target,
      href: "/dashboard/contacts",
      color: "emerald",
    },
    {
      title: "Leads",
      value: totalLeads,
      sub: "Won",
      icon: Target,
      href: "/dashboard/leads",
      color: "violet",
    },
    {
      title: "Lost",
      value: totalLost,
      sub: "Closed lost",
      icon: XCircle,
      href: "/dashboard/lost",
      color: "red",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">
        Real-time overview of leads, demos, and activity
      </p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-10">
        {cards.map(({ title, value, sub, icon: Icon, href, color }) => (
          <Link
            key={title}
            href={href}
            className={`rounded-xl border border-slate-700/60 bg-slate-900/60 p-5 hover:border-slate-600 transition-all duration-200 group ${
              color === "blue"
                ? "hover:border-blue-500/50"
                : color === "emerald"
                  ? "hover:border-emerald-500/50"
                  : color === "violet"
                    ? "hover:border-violet-500/50"
                    : color === "red"
                      ? "hover:border-red-500/50"
                      : "hover:border-amber-500/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
                <p className="text-slate-500 text-xs mt-1">{sub}</p>
              </div>
              <Icon className="w-8 h-8 text-slate-600 group-hover:text-slate-500 transition-colors" />
            </div>
            <div className="mt-3 flex items-center text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
              View
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/60">
            <h2 className="font-semibold text-white">Status distribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">Contacts + Demos by status</p>
          </div>
          <div className="p-4">
            <StatusPieChart contacts={contacts} demos={demos} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Recent activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Status changes and new submissions</p>
            </div>
            <Link href="/dashboard" className="text-sm text-blue-400 hover:underline">
              Refresh
            </Link>
          </div>
          <div className="p-4 max-h-[320px] overflow-y-auto">
            <ActivityFeed limit={15} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent contacts</h2>
            <Link href="/dashboard/contacts" className="text-sm text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-700/40">
            {(contacts?.data?.length ? contacts.data.slice(0, 5) : []).map((c) => (
              <div
                key={c.id}
                className="px-4 py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-white font-medium">{c.full_name}</p>
                  <p className="text-slate-400">{c.email}</p>
                </div>
                <StatusBadge status={c.status || "Pending"} size="sm" />
              </div>
            ))}
            {(!contacts?.data?.length || contacts.data.length === 0) && (
              <p className="px-4 py-6 text-slate-500 text-sm text-center">
                No contacts yet
              </p>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent demos</h2>
            <Link href="/dashboard/demos" className="text-sm text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-700/40">
            {(demos?.data?.length ? demos.data.slice(0, 5) : []).map((d) => (
              <div
                key={d.id}
                className="px-4 py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-white font-medium">{d.full_name}</p>
                  <p className="text-slate-400">{d.email}</p>
                </div>
                <StatusBadge status={d.status || "Pending"} size="sm" />
              </div>
            ))}
            {(!demos?.data?.length || demos.data.length === 0) && (
              <p className="px-4 py-6 text-slate-500 text-sm text-center">
                No demos yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
