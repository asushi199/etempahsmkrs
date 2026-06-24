# e-Tempah Bilik SMKRS

Sistem tempahan bilik khas untuk **SMK Raja Shahriman**. Membolehkan guru menempah
bilik (Bilik Sains, Makmal Komputer A & B, dan lain-lain) secara dalam talian,
mengelakkan pertindihan tempahan, serta membenarkan pihak sekolah mengurus senarai
bilik, logo dan nama sistem sendiri.

Antara muka sepenuhnya dalam **Bahasa Melayu**.

## Ciri Utama

- 🏫 Senarai bilik & tempahan dalam talian (guru cukup isi nama + mata pelajaran).
- 🚫 Halangan pertindihan automatik (tiada dua tempahan bertindih untuk bilik sama).
- ➕ Tambah / edit / padam bilik sendiri (halaman Tetapan).
- 🖼️ Muat naik logo sekolah & tukar nama sistem.
- 📅 Senarai tempahan harian semua bilik.

## Teknologi

- **Next.js (App Router) + TypeScript** — frontend & API.
- **Tailwind CSS** — antara muka.
- **Supabase (Postgres + Storage)** — pangkalan data & simpanan logo.
- **Vercel** — hosting (percuma).

## Persediaan (Setup)

### 1. Pasang kebergantungan
```bash
npm install
```

### 2. Sediakan Supabase
1. Buat projek di [supabase.com](https://supabase.com) (percuma).
2. Buka **SQL Editor** → tampal & jalankan kandungan `supabase/schema.sql`.
3. Buka **Storage** → buat bucket **awam (public)** bernama `logos`.
4. Buka **Project Settings → API** untuk dapatkan URL projek dan *service role key*.

### 3. Pemboleh ubah persekitaran
Salin `.env.local.example` kepada `.env.local`, kemudian isi:
```
NEXT_PUBLIC_SUPABASE_URL=...        # URL projek Supabase
SUPABASE_SERVICE_ROLE_KEY=...       # Service role key (RAHSIA)
ADMIN_PASSWORD=...                  # Kata laluan halaman Tetapan
```

### 4. Jalankan secara tempatan
```bash
npm run dev
```
Buka http://localhost:3000

## Struktur Halaman

| Laluan | Fungsi |
|---|---|
| `/` | Senarai bilik tersedia |
| `/bilik/[id]` | Borang tempahan untuk satu bilik |
| `/tempahan` | Senarai semua tempahan mengikut tarikh |
| `/admin` | Tetapan pentadbir (kata laluan) — urus bilik, logo, nama |

## Deploy ke Vercel

1. Tolak (push) projek ke GitHub.
2. Import repo di [vercel.com](https://vercel.com).
3. Isikan pemboleh ubah persekitaran yang sama seperti `.env.local`.
4. Deploy — Vercel akan beri URL HTTPS automatik.

## Keselamatan

- `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di pelayan; jangan dedahkan.
- Operasi pentadbir (urus bilik/logo/nama) dilindungi `ADMIN_PASSWORD`.
- Tempahan guru tidak memerlukan log masuk (alat dalaman sekolah).
