"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Contact, Demo } from "@/lib/types";

type OnNewContact = (contact: Contact) => void;
type OnNewDemo = (demo: Demo) => void;
type OnContactStatusUpdated = (contact: Contact) => void;
type OnDemoStatusUpdated = (demo: Demo) => void;

interface SocketContextValue {
  connected: boolean;
  onNewContact: (cb: OnNewContact) => () => void;
  onNewDemo: (cb: OnNewDemo) => () => void;
  onContactStatusUpdated: (cb: OnContactStatusUpdated) => () => void;
  onDemoStatusUpdated: (cb: OnDemoStatusUpdated) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

function getSocketUrl(): string {
  if (typeof window === "undefined") return "";
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_WS_URL || "";
  if (envUrl) return envUrl;

  // Only auto-guess in local development. In production (e.g. Vercel),
  // the Socket.IO server must be hosted separately and configured via env.
  const { hostname, origin } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    if (origin.includes("3001")) return "http://localhost:5000";
    return "http://localhost:5000";
  }

  return "";
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = React.useState(false);

  const newContactListeners = useRef<Set<OnNewContact>>(new Set());
  const newDemoListeners = useRef<Set<OnNewDemo>>(new Set());
  const contactStatusListeners = useRef<Set<OnContactStatusUpdated>>(new Set());
  const demoStatusListeners = useRef<Set<OnDemoStatusUpdated>>(new Set());

  useEffect(() => {
    const url = getSocketUrl();
    if (!url) return;

    const socket = io(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_contact", (contact: Contact) => {
      newContactListeners.current.forEach((cb) => cb(contact));
    });
    socket.on("new_demo", (demo: Demo) => {
      newDemoListeners.current.forEach((cb) => cb(demo));
    });
    socket.on("contact_status_updated", (contact: Contact) => {
      contactStatusListeners.current.forEach((cb) => cb(contact));
    });
    socket.on("demo_status_updated", (demo: Demo) => {
      demoStatusListeners.current.forEach((cb) => cb(demo));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, []);

  const onNewContact = useCallback((cb: OnNewContact) => {
    newContactListeners.current.add(cb);
    return () => {
      newContactListeners.current.delete(cb);
    };
  }, []);

  const onNewDemo = useCallback((cb: OnNewDemo) => {
    newDemoListeners.current.add(cb);
    return () => {
      newDemoListeners.current.delete(cb);
    };
  }, []);

  const onContactStatusUpdated = useCallback((cb: OnContactStatusUpdated) => {
    contactStatusListeners.current.add(cb);
    return () => {
      contactStatusListeners.current.delete(cb);
    };
  }, []);

  const onDemoStatusUpdated = useCallback((cb: OnDemoStatusUpdated) => {
    demoStatusListeners.current.add(cb);
    return () => {
      demoStatusListeners.current.delete(cb);
    };
  }, []);

  const value: SocketContextValue = {
    connected,
    onNewContact,
    onNewDemo,
    onContactStatusUpdated,
    onDemoStatusUpdated,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
