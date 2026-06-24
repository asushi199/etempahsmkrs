import { createClient } from "@supabase/supabase-js";

// Klien Supabase sisi-pelayan menggunakan SERVICE ROLE KEY.
// HANYA boleh diimport dalam Server Components, Route Handlers, atau kod pelayan lain.
// Jangan sekali-kali diimport ke dalam komponen klien ("use client").
//
// Semua bacaan & tulisan data melalui klien ini supaya kunci anon tidak
// perlu didedahkan dan akses dilindungi di lapisan pelayan.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Pemboleh ubah persekitaran NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY mesti ditetapkan. Lihat .env.local.example."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const LOGO_BUCKET = "logos";
