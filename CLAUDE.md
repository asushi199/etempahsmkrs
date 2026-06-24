# Panduan Projek — e-Tempah Bilik SMKRS

Sistem tempahan bilik sekolah (Next.js + Supabase). Antara muka **mesti** Bahasa Melayu.

## Prinsip
- Buat perubahan paling kecil yang masih betul; kekalkan tingkah laku sedia ada.
- Semua teks antara muka pengguna dalam **Bahasa Melayu**.
- Jangan dedahkan `SUPABASE_SERVICE_ROLE_KEY` atau `ADMIN_PASSWORD` ke sisi klien.

## Seni Bina
- **App Router** (`app/`). Bacaan data guna Server Component melalui `lib/data.ts`.
- Semua tulisan/mutasi melalui Route Handler dalam `app/api/**`.
- Klien Supabase (`lib/supabase.ts`) guna *service role key* — **hanya import di pelayan**,
  jangan import dalam fail `"use client"`.
- Operasi pentadbir disahkan dengan header `x-admin-password` (lihat `lib/auth.ts`).

## Fail Penting
- `lib/supabase.ts` — klien Supabase sisi-pelayan.
- `lib/data.ts` — fungsi bacaan data.
- `lib/auth.ts` — semakan kata laluan pentadbir.
- `app/api/bookings/route.ts` — cipta/senarai tempahan (semakan pertindihan: kod ralat `23P01`).
- `app/api/rooms/**`, `app/api/settings/**` — pentadbir.
- `supabase/schema.sql` — skema + `EXCLUDE` constraint (halang pertindihan).

## Pertindihan Tempahan
Dikuatkuasakan di pangkalan data melalui constraint `no_overlap` (EXCLUDE/gist).
Lapisan API memetakan ralat `23P01` kepada mesej Melayu mesra pengguna.

## Verifikasi
- `npx tsc --noEmit` untuk semakan jenis.
- `npm run dev` + uji tempah dua slot bertindih (mesti ditolak).
