# AGENTS.md

Panduan untuk ejen AI yang bekerja pada projek ini. Sama seperti `CLAUDE.md`.

## Ringkasan
Sistem tempahan bilik SMK Raja Shahriman — Next.js (App Router) + TypeScript +
Tailwind + Supabase. Antara muka pengguna **mesti Bahasa Melayu**.

## Peraturan
1. Teks UI dalam Bahasa Melayu sahaja.
2. Jangan import `lib/supabase.ts` (service role) ke dalam komponen `"use client"`.
3. Mutasi data melalui Route Handler (`app/api/**`), dilindungi `x-admin-password`
   untuk operasi pentadbir.
4. Kekalkan halangan pertindihan di pangkalan data (`supabase/schema.sql`).
5. Perubahan minimum; jangan ubah fail tidak berkaitan.

## Arahan Biasa
- Pasang: `npm install`
- Pembangunan: `npm run dev`
- Semakan jenis: `npx tsc --noEmit`
- Bina: `npm run build`

## Persekitaran
Perlukan `.env.local` dengan `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, dan `ADMIN_PASSWORD`. Lihat `.env.local.example`.
