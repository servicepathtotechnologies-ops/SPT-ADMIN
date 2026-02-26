function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminToken");
}

function headers(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(email: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export interface FetchContactsParams {
  limit?: number;
  offset?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function fetchContacts(params?: FetchContactsParams) {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.offset != null) q.set("offset", String(params.offset));
  if (params?.status) q.set("status", params.status);
  if (params?.dateFrom) q.set("dateFrom", params.dateFrom);
  if (params?.dateTo) q.set("dateTo", params.dateTo);
  if (params?.search) q.set("search", params.search);
  const res = await fetch(`/api/contacts?${q}`, { headers: headers() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch contacts");
  return data;
}

export async function updateContactStatus(id: string, status: string) {
  const res = await fetch(`/api/contacts/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ status }),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Update failed");
  return data;
}

export async function deleteContact(id: string) {
  const res = await fetch(`/api/contacts/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 204) return;
  const data = await res.json();
  throw new Error(data.error || "Delete failed");
}

export interface FetchDemosParams {
  limit?: number;
  offset?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function fetchDemos(params?: FetchDemosParams) {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.offset != null) q.set("offset", String(params.offset));
  if (params?.status) q.set("status", params.status);
  if (params?.dateFrom) q.set("dateFrom", params.dateFrom);
  if (params?.dateTo) q.set("dateTo", params.dateTo);
  if (params?.search) q.set("search", params.search);
  const res = await fetch(`/api/demos?${q}`, { headers: headers() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch demos");
  return data;
}

export async function updateDemoStatus(id: string, status: string) {
  const res = await fetch(`/api/demos/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ status }),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Update failed");
  return data;
}

export async function deleteDemo(id: string) {
  const res = await fetch(`/api/demos/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 204) return;
  const data = await res.json();
  throw new Error(data.error || "Delete failed");
}

export async function fetchLeads(params?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.offset != null) q.set("offset", String(params.offset));
  const res = await fetch(`/api/leads?${q}`, { headers: headers() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch leads");
  return data;
}

export async function fetchLost(params?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.offset != null) q.set("offset", String(params.offset));
  const res = await fetch(`/api/lost?${q}`, { headers: headers() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch lost");
  return data;
}

export async function fetchActivity(params?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.offset != null) q.set("offset", String(params.offset));
  const res = await fetch(`/api/activity?${q}`, { headers: headers() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch activity");
  return data;
}
