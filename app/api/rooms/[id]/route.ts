import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/rooms/:id  -> kemas kini nama/keterangan bilik (pentadbir)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }
  const { id } = await params;

  let body: { name?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Nama bilik diperlukan." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("rooms")
    .update({ name, description: body.description?.trim() || null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ room: data });
}

// DELETE /api/rooms/:id  -> padam bilik (soft delete: is_active = false)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("rooms")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
