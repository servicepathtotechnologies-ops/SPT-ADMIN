import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "") || "";

function authFailed() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return authFailed();
  const { id } = await params;
  if (!id || !BACKEND_URL) {
    return NextResponse.json(
      { error: id ? "Backend not configured." : "Missing id." },
      { status: id ? 503 : 400 }
    );
  }
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Update failed." },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("Contact PATCH proxy error:", e);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = _req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return authFailed();
  const { id } = await params;
  if (!id || !BACKEND_URL) {
    return NextResponse.json(
      { error: id ? "Backend not configured." : "Missing id." },
      { status: id ? 503 : 400 }
    );
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/contact/${id}`, {
      method: "DELETE",
      headers: { Authorization: auth },
    });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: data.message || "Delete failed." },
      { status: res.status }
    );
  } catch (e) {
    console.error("Contact DELETE proxy error:", e);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
