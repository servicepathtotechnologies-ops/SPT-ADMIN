import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "") || "";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Backend not configured." },
      { status: 503 }
    );
  }
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.toString(); // includes limit, offset, status, dateFrom, dateTo, search
    const res = await fetch(`${BACKEND_URL}/api/contact${query ? `?${query}` : ""}`, {
      headers: { Authorization: auth },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch contacts." },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("Contacts proxy error:", e);
    return NextResponse.json({ error: "Failed to fetch contacts." }, { status: 500 });
  }
}
