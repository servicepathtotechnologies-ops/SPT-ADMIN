import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "") || "";

export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Backend not configured. Set BACKEND_URL." },
      { status: 503 }
    );
  }
  try {
    const body = await req.json();
    const { email, password } = body;
    const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email?.trim() || "", password: password ?? "" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Login failed." },
        { status: res.status }
      );
    }
    return NextResponse.json({ token: data.token, admin: data.admin });
  } catch (e) {
    console.error("Login proxy error:", e);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
