import { NextResponse } from "next/server";
import { supabaseAdmin, LOGO_BUCKET } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/settings/logo  -> muat naik logo sekolah (pentadbir)
// Terima multipart/form-data dengan medan "file".
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Fail logo diperlukan." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Sila muat naik fail imej sahaja." },
      { status: 400 }
    );
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Saiz logo maksimum 2MB." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `logo-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(LOGO_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json(
      { error: `Muat naik gagal: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: pub } = supabaseAdmin.storage.from(LOGO_BUCKET).getPublicUrl(path);
  const logoUrl = pub.publicUrl;

  const { data, error } = await supabaseAdmin
    .from("settings")
    .update({ logo_url: logoUrl })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data });
}
