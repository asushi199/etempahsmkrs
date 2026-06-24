import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/settings  -> tetapan jenama semasa
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data });
}

// PUT /api/settings  -> kemas kini nama sistem (pentadbir)
export async function PUT(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  let body: { system_name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const systemName = body.system_name?.trim();
  if (!systemName) {
    return NextResponse.json(
      { error: "Nama sistem diperlukan." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("settings")
    .update({ system_name: systemName })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data });
}
