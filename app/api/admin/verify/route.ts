import { NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/admin/verify  -> sahkan kata laluan pentadbir
export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  if (checkAdminPassword(body.password)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Kata laluan salah." }, { status: 401 });
}
