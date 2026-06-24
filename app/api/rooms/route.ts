import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/rooms  -> senarai bilik aktif
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ rooms: data ?? [] });
}

// POST /api/rooms  -> tambah bilik (pentadbir sahaja)
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  let body: { name?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { error: "Nama bilik diperlukan." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("rooms")
    .insert({ name, description: body.description?.trim() || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ room: data }, { status: 201 });
}
