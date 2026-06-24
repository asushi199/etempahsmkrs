-- =====================================================================
-- e-Tempah Bilik SMKRS — Skema Pangkalan Data (Supabase / Postgres)
-- Jalankan keseluruhan fail ini di: Supabase Dashboard > SQL Editor.
-- =====================================================================

-- Sambungan diperlukan untuk EXCLUDE constraint (gabungan btree + gist)
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------
-- Jadual: rooms (bilik) — boleh tambah/padam sendiri oleh pentadbir
-- ---------------------------------------------------------------------
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  is_active   boolean not null default true,   -- padam = soft delete (kekalkan sejarah tempahan)
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Jadual: bookings (tempahan)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id) on delete cascade,
  booking_date date not null,
  start_time   time not null,
  end_time     time not null,
  teacher_name text not null,
  purpose      text not null,
  created_at   timestamptz not null default now(),

  -- Masa tamat mesti selepas masa mula
  constraint valid_time check (end_time > start_time),

  -- HALANG PERTINDIHAN: bilik + tarikh yang sama tidak boleh ada slot masa bertindih.
  -- Tarikh tetap '2000-01-01' digunakan hanya untuk membina julat masa harian.
  constraint no_overlap exclude using gist (
    room_id with =,
    booking_date with =,
    tsrange(('2000-01-01'::date + start_time), ('2000-01-01'::date + end_time)) with &&
  )
);

create index if not exists idx_bookings_room_date
  on public.bookings (room_id, booking_date);

-- ---------------------------------------------------------------------
-- Jadual: settings (tetapan jenama — satu baris sahaja, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id          int primary key default 1,
  system_name text not null default 'e-Tempah Bilik SMKRS',
  logo_url    text,
  constraint settings_single_row check (id = 1)
);

-- Pastikan satu baris tetapan wujud
insert into public.settings (id, system_name)
values (1, 'e-Tempah Bilik SMKRS')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Data awal: bilik yang sudah diketahui
-- ---------------------------------------------------------------------
insert into public.rooms (name, description) values
  ('Bilik Sains',        'Makmal Sains sekolah'),
  ('Makmal Komputer A',  'Makmal Komputer A'),
  ('Makmal Komputer B',  'Makmal Komputer B')
on conflict do nothing;

-- =====================================================================
-- Storan logo:
-- Buat bucket AWAM bernama 'logos' di: Storage > New bucket > Public.
-- Muat naik logo dikendalikan oleh pelayan menggunakan service role key.
-- =====================================================================
