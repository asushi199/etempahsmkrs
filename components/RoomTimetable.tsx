"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { BookingWithRoom } from "@/lib/types";
import { getAdminPassword } from "@/lib/adminClient";
import {
  addDays,
  startOfWeek,
  toISO,
  weekDays,
  monthLabel,
  HARI_PENDEK,
} from "@/lib/calendar";

// Waktu persekolahan: 07:45 – 14:45, slot 30 minit
const START_MIN = 7 * 60 + 45; // 465
const END_MIN = 14 * 60 + 45; // 885
const SLOT = 30;
const SLOTS: number[] = [];
for (let m = START_MIN; m < END_MIN; m += SLOT) SLOTS.push(m);

// Semua titik masa pada grid 30 minit (termasuk masa tamat 14:45) untuk borang
const GRID_TIMES: number[] = [];
for (let m = START_MIN; m <= END_MIN; m += SLOT) GRID_TIMES.push(m);

// Susun atur mendatar (mendatar = masa pada paksi-X, hari pada paksi-Y)
const COL_PX = 78; // lebar setiap slot 30 minit
const ROW_PX = 62; // tinggi setiap baris hari
const LABEL_W = 96; // lebar lajur label hari
const TRACK_PX = SLOTS.length * COL_PX; // lebar keseluruhan jalur masa

function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

type SlotPick = { dateISO: string; startMin: number } | null;

export default function RoomTimetable({
  roomId,
  roomName,
}: {
  roomId: string;
  roomName: string;
}) {
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [bookings, setBookings] = useState<BookingWithRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pick, setPick] = useState<SlotPick>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    setIsAdmin(!!getAdminPassword());
  }, []);

  // Isnin–Jumaat bagi minggu semasa
  const days = useMemo(() => weekDays(anchor).slice(0, 5), [anchor]);
  const range = useMemo(
    () => ({ from: toISO(days[0]), to: toISO(days[days.length - 1]) }),
    [days]
  );

  const loadBookings = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      from: range.from,
      to: range.to,
      roomId,
    });
    fetch(`/api/bookings?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setBookings(j.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [range, roomId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const byDate = useMemo(() => {
    const map = new Map<string, BookingWithRoom[]>();
    for (const b of bookings) {
      const list = map.get(b.booking_date) ?? [];
      list.push(b);
      map.set(b.booking_date, list);
    }
    return map;
  }, [bookings]);

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const todayISO = toISO(new Date());

  function isPast(dateISO: string, startMin: number): boolean {
    if (dateISO < todayISO) return true;
    if (dateISO === todayISO && startMin < nowMin) return true;
    return false;
  }

  async function cancelBooking(b: BookingWithRoom) {
    const pwd = getAdminPassword();
    if (!pwd) return;
    if (!confirm(`Batalkan tempahan ${minToTime(timeToMin(b.start_time))}–${minToTime(timeToMin(b.end_time))} (${b.teacher_name})?`))
      return;
    const res = await fetch(`/api/bookings/${b.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": pwd },
    });
    if (res.ok) {
      setMsg({ type: "ok", text: "Tempahan dibatalkan." });
      loadBookings();
    } else {
      const j = await res.json();
      setMsg({ type: "err", text: j.error ?? "Gagal membatalkan." });
    }
  }

  const weekLabel = (() => {
    const a = days[0];
    const b = days[days.length - 1];
    return `${a.getDate()} – ${b.getDate()} ${monthLabel(b)}`;
  })();

  return (
    <div>
      {isAdmin && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Mod Pentadbir aktif — klik tempahan untuk batalkan.
        </p>
      )}

      {/* Navigasi minggu */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setAnchor((d) => addDays(startOfWeek(d), -7))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          &larr; Minggu Lalu
        </button>
        <button
          onClick={() => setAnchor(new Date())}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Minggu Ini
        </button>
        <button
          onClick={() => setAnchor((d) => addDays(startOfWeek(d), 7))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Minggu Depan &rarr;
        </button>
        <span className="ml-auto text-sm font-semibold text-slate-700">
          {weekLabel}
        </span>
      </div>

      {msg && (
        <p
          className={
            msg.type === "ok"
              ? "mb-2 text-sm text-green-700"
              : "mb-2 text-sm text-red-600"
          }
        >
          {msg.text}
        </p>
      )}
      {loading && <p className="mb-2 text-sm text-slate-400">Memuatkan…</p>}

      {/* Jadual waktu (mendatar: masa pada paksi-X, hari pada paksi-Y) */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <div style={{ minWidth: LABEL_W + TRACK_PX }}>
          {/* Pengepala masa */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <div
              className="sticky left-0 z-30 shrink-0 border-r border-slate-200 bg-slate-50"
              style={{ width: LABEL_W }}
            />
            <div className="relative" style={{ width: TRACK_PX, height: 28 }}>
              {SLOTS.map((m, i) => (
                <div
                  key={m}
                  className="absolute top-1 text-[11px] text-slate-500"
                  style={{ left: i * COL_PX + 4 }}
                >
                  {minToTime(m)}
                </div>
              ))}
              <div
                className="absolute top-1 text-[11px] text-slate-500"
                style={{ left: TRACK_PX - 28 }}
              >
                {minToTime(END_MIN)}
              </div>
            </div>
          </div>

          {/* Baris hari */}
          {days.map((d) => {
            const iso = toISO(d);
            const isToday = iso === todayISO;
            const list = byDate.get(iso) ?? [];
            return (
              <div key={iso} className="flex border-b border-slate-100 last:border-b-0">
                {/* Label hari */}
                <div
                  className={
                    "sticky left-0 z-20 flex shrink-0 flex-col justify-center border-r border-slate-200 px-2 " +
                    (isToday ? "bg-brand-50" : "bg-slate-50")
                  }
                  style={{ width: LABEL_W, height: ROW_PX }}
                >
                  <p className="text-xs font-medium text-slate-500">
                    {HARI_PENDEK[(d.getDay() + 6) % 7]}
                  </p>
                  <p
                    className={
                      "text-sm font-semibold " +
                      (isToday ? "text-brand-700" : "text-slate-900")
                    }
                  >
                    {d.getDate()}
                  </p>
                </div>

                {/* Jalur masa */}
                <div className="relative" style={{ width: TRACK_PX, height: ROW_PX }}>
                  {/* Sel kosong (boleh klik untuk tempah) */}
                  {SLOTS.map((m, i) => {
                    const past = isPast(iso, m);
                    return (
                      <button
                        key={m}
                        type="button"
                        disabled={past}
                        onClick={() => setPick({ dateISO: iso, startMin: m })}
                        className={
                          "absolute top-0 bottom-0 border-r border-slate-100 " +
                          (past
                            ? "cursor-not-allowed bg-slate-50"
                            : "hover:bg-brand-50")
                        }
                        style={{ left: i * COL_PX, width: COL_PX }}
                        aria-label={`Tempah ${minToTime(m)} pada ${iso}`}
                      />
                    );
                  })}

                  {/* Blok tempahan */}
                  {list.map((b) => {
                    const s = Math.max(timeToMin(b.start_time), START_MIN);
                    const e = Math.min(timeToMin(b.end_time), END_MIN);
                    if (e <= START_MIN || s >= END_MIN) return null;
                    const left = ((s - START_MIN) / SLOT) * COL_PX;
                    const width = Math.max(((e - s) / SLOT) * COL_PX - 2, 28);
                    return (
                      <div
                        key={b.id}
                        onClick={() => isAdmin && cancelBooking(b)}
                        className={
                          "absolute top-1 bottom-1 overflow-hidden rounded border border-brand-200 bg-brand-100 px-1.5 py-1 text-[11px] leading-tight text-brand-900 " +
                          (isAdmin ? "cursor-pointer hover:bg-red-100" : "")
                        }
                        style={{ left: left + 1, width }}
                        title={`${minToTime(timeToMin(b.start_time))}–${minToTime(
                          timeToMin(b.end_time)
                        )} · ${b.teacher_name} · ${b.purpose}`}
                      >
                        <span className="block font-semibold">
                          {minToTime(timeToMin(b.start_time))}–
                          {minToTime(timeToMin(b.end_time))}
                        </span>
                        <span className="block truncate">{b.teacher_name}</span>
                        <span className="block truncate text-brand-700">
                          {b.purpose}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Klik mana-mana petak kosong untuk membuat tempahan.
      </p>

      {/* Modal borang tempahan */}
      {pick && (
        <BookingModal
          roomId={roomId}
          roomName={roomName}
          dateISO={pick.dateISO}
          startMin={pick.startMin}
          onClose={() => setPick(null)}
          onSuccess={() => {
            setPick(null);
            setMsg({ type: "ok", text: "Tempahan berjaya disimpan!" });
            loadBookings();
          }}
        />
      )}
    </div>
  );
}

// -------------------- Modal borang tempahan --------------------
function BookingModal({
  roomId,
  roomName,
  dateISO,
  startMin,
  onClose,
  onSuccess,
}: {
  roomId: string;
  roomName: string;
  dateISO: string;
  startMin: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [teacherName, setTeacherName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState(minToTime(startMin));
  const [endTime, setEndTime] = useState(minToTime(Math.min(startMin + SLOT, END_MIN)));
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (endTime <= startTime) {
      setErr("Masa tamat mesti selepas masa mula.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          date: dateISO,
          startTime,
          endTime,
          teacherName: teacherName.trim(),
          purpose: purpose.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) setErr(json.error ?? "Tempahan gagal.");
      else onSuccess();
    } catch {
      setErr("Ralat rangkaian. Sila cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-900">Tempah {roomName}</h3>
        <p className="mt-1 text-sm text-slate-500">{dateISO}</p>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nama Guru
            </label>
            <input
              type="text"
              required
              autoFocus
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="cth: Cikgu Ahmad"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mata Pelajaran / Tujuan
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="cth: Sains Tingkatan 4"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Masa Mula
              </label>
              <select
                required
                value={startTime}
                onChange={(e) => {
                  const v = e.target.value;
                  setStartTime(v);
                  // Pastikan masa tamat sentiasa selepas masa mula
                  if (timeToMin(endTime) <= timeToMin(v)) {
                    setEndTime(minToTime(Math.min(timeToMin(v) + SLOT, END_MIN)));
                  }
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
              >
                {GRID_TIMES.filter((m) => m < END_MIN).map((m) => (
                  <option key={m} value={minToTime(m)}>
                    {minToTime(m)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Masa Tamat
              </label>
              <select
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
              >
                {GRID_TIMES.filter((m) => m > timeToMin(startTime)).map((m) => (
                  <option key={m} value={minToTime(m)}>
                    {minToTime(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? "Menyimpan…" : "Tempah Sekarang"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
