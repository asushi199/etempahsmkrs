# AI Context Log

Rekod konteks & keputusan penting projek untuk kesinambungan sesi AI.

## 2026-06-24 — Permulaan projek

**Permintaan:** Sebuah sekolah (SMK Raja Shahriman) mahu sistem tempahan bilik
untuk mengelak bilik khas (Bilik Sains, Makmal Komputer A & B) bertindih, dan
memudahkan guru menempah. Bilangan bilik tidak tetap → perlu boleh tambah/padam
sendiri. Mahu boleh muat naik logo sekolah & tukar nama sistem. UI mesti Bahasa Melayu.

**Keputusan disahkan pengguna:**
- Hosting: cloud percuma (Vercel + Supabase).
- Identiti guru: cukup isi nama + mata pelajaran, tiada log masuk.
- Tiada kelulusan pentadbir — tempahan serta-merta (first-come-first-served).
- Operasi pentadbir (urus bilik/logo/nama) dilindungi `ADMIN_PASSWORD`.

**Nama sistem dicadangkan:** `e-Tempah Bilik SMKRS` (boleh tukar di halaman Tetapan).

**Seni bina:**
- Next.js App Router + TypeScript + Tailwind.
- Supabase Postgres (3 jadual: `rooms`, `bookings`, `settings`) + Storage (`logos`).
- Pertindihan dihalang oleh constraint `EXCLUDE` (gist) dalam `supabase/schema.sql`.
- Bacaan: Server Component via `lib/data.ts`. Tulisan: Route Handler `app/api/**`.

**Status:** Kod siap & DISAHKAN end-to-end pada Supabase sebenar.

## 2026-06-24 — Tambahan: Jadual minggu/bulan + batal oleh pentadbir

- Halaman `/tempahan` dinaik taraf kepada **Jadual Tempahan** (`components/ScheduleClient.tsx`):
  penapis bilik, togol Minggu/Bulan, navigasi tempoh.
- `GET /api/bookings` kini sokong mod julat `?from&to[&roomId]` (selain mod tarikh tunggal).
- Pentadbir (log masuk di `/admin`, kata laluan disimpan dalam sessionStorage —
  `lib/adminClient.ts`) nampak butang **Batal** pada jadual → `DELETE /api/bookings/:id`.

**Verifikasi dilakukan (npm run dev pada Supabase sebenar):**
- Cipta tempahan ✅ · Pertindihan ditolak 409 ✅ · Slot bersebelahan dibenarkan ✅
- Senarai julat + nama bilik ✅ · DELETE: salah kata laluan 401 / betul berjaya ✅
- Jadual 3 bilik benih wujud, bucket `logos` (public) wujud ✅
- Nota: jika campur `next build` (prod) dengan `next dev`, padam folder `.next` dahulu.

## 2026-06-24 — Naik taraf halaman bilik kepada jadual waktu

- `/bilik/[id]` kini guna `components/RoomTimetable.tsx` (gantikan BookingClient lama,
  fail itu dipadam).
- Jadual waktu mingguan: paksi-Y 07:30–14:00 (slot 30 min), paksi-X Isnin–Jumaat.
- Klik petak kosong → modal borang tempahan (auto-isi tarikh + masa).
- Blok tempahan papar masa/guru/tujuan; pentadbir klik blok untuk batal.
- Navigasi Minggu Lalu / Minggu Ini / Minggu Depan. Petak masa lampau dimatikan.
- Disahkan: semua halaman (/, /tempahan, /bilik/:id, /admin) pulang 200; jadual
  memuatkan tempahan ikut julat minggu.

## 2026-06-24 — Cetak jadual (minggu/bulan) oleh pentadbir

- Butang **Cetak** pada `/tempahan` (hanya nampak bila pentadbir log masuk) →
  panggil `window.print()`.
- CSS cetak dalam `app/globals.css`: kelas `.no-print` (sembunyi semasa cetak),
  `.print-only` (tajuk cetak: bilik + jenis paparan), `.week-grid` paksa 7 lajur,
  `.avoid-break` elak sel dipotong, `@page margin`. Logo+nama sekolah kekal sebagai kepala surat.
- Cetak menghormati penapis bilik + paparan minggu/bulan semasa. Disahkan: tsc + /tempahan 200.

**Waktu sekolah:** jadual bilik kini 07:45–14:45 (slot 30 min, 14 petak).

**Langkah seterusnya:** Push ke GitHub → deploy Vercel (isi env yang sama).
**Idea akan datang (jika perlu):** sokong Sabtu, tempahan berulang, eksport Excel.
