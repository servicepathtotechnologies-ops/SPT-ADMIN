"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Calendar,
  Target,
  XCircle,
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/contacts", label: "Contacts", icon: Mail },
  { href: "/dashboard/demos", label: "Demos", icon: Calendar },
  { href: "/dashboard/leads", label: "Leads", icon: Target },
  { href: "/dashboard/lost", label: "Lost", icon: XCircle },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    sessionStorage.removeItem("adminToken");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="w-56 border-r border-slate-800 bg-slate-900/50 flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Admin CRM</h2>
          <p className="text-xs text-slate-400 mt-0.5">SPT Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === href
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto min-h-screen">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
