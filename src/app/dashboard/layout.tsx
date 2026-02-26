"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SocketProvider } from "@/context/SocketContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) router.replace("/login");
  }, [router]);

  return (
    <SocketProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SocketProvider>
  );
}
