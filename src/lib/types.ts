// Contact workflow: Pending, Processing, Contacted, Qualified, Lead, Lost
export const CONTACT_STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Contacted",
  "Qualified",
  "Lead",
  "Lost",
] as const;

// Demo workflow: Pending, Scheduled, Completed, Cancelled, Lead, Lost
export const DEMO_STATUS_OPTIONS = [
  "Pending",
  "Scheduled",
  "Completed",
  "Cancelled",
  "Lead",
  "Lost",
] as const;

// Legacy alias for components that still use STATUS_OPTIONS
export const STATUS_OPTIONS = [...CONTACT_STATUS_OPTIONS] as const;
export type ContactStatus = (typeof CONTACT_STATUS_OPTIONS)[number];
export type DemoStatus = (typeof DEMO_STATUS_OPTIONS)[number];
export type Status = ContactStatus | DemoStatus;

export const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "bg-amber-500/20", text: "text-amber-400" },
  Processing: { bg: "bg-blue-500/20", text: "text-blue-400" },
  Contacted: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  Qualified: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  Lead: { bg: "bg-violet-500/20", text: "text-violet-400" },
  Lost: { bg: "bg-red-500/20", text: "text-red-400" },
  Scheduled: { bg: "bg-blue-500/20", text: "text-blue-400" },
  Completed: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  Cancelled: { bg: "bg-slate-500/20", text: "text-slate-400" },
};

export interface Contact {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: string;
  created_at: string;
}

export interface Demo {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  demo_date: string;
  service: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface ContactsResponse {
  success: boolean;
  data: Contact[];
  count: number;
  total: number;
}

export interface DemosResponse {
  success: boolean;
  data: Demo[];
  count: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  entity_type: "contact" | "demo";
  entity_id: string;
  old_status: string | null;
  new_status: string;
  updated_by: string | null;
  updated_at: string;
  full_name?: string;
}

export interface ActivityResponse {
  success: boolean;
  data: ActivityItem[];
  count: number;
  total: number;
}

export interface LeadOrLostItem extends Partial<Contact>, Partial<Demo> {
  entity_type: "contact" | "demo";
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
}

export interface LeadsResponse {
  success: boolean;
  data: LeadOrLostItem[];
  count: number;
  total: number;
  contactsTotal?: number;
  demosTotal?: number;
}

export interface LostResponse {
  success: boolean;
  data: LeadOrLostItem[];
  count: number;
  total: number;
  contactsTotal?: number;
  demosTotal?: number;
}

export interface FilterParams {
  limit?: number;
  offset?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
