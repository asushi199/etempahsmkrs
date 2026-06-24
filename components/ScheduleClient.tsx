"use client";

import { useEffect, useMemo, useState } from "react";
import type { BookingWithRoom, Room } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { getAdminPassword } from "@/lib/adminClient";
import {
  addDays,
  addMonths,
  endOfMonth,
  monthGridDays,
  monthLabel,
  startOfMonth,
  startOfWeek,
  toISO,
  weekDays,
  HARI_PENDEK,
} from "@/lib/calendar";

type View = "minggu" | "bulan";

export default function ScheduleClient() {
  const [view, setView] = useState<View>("minggu");
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [roomId, setRoomId] = useState<string>(""); // "" = semua bilik
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<BookingWithRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsAdmin(!!getAdminPassword());
  }, []);

  // Muat senarai bilik untuk penapis
  useEffect(() => {
    fetch("/api/rooms", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRooms(j.rooms ?? []))
      .catch(() => setRooms([]));
  }, []);

  // Julat tarikh yang dipaparkan
  const range = useMemo(() => {
    if (view === "minggu") {
      const start = startOfWeek(anchor);
      return { from: toISO(start), to: toISO(addDays(start, 6)) };
    }
    const days = monthGridDays(anchor);
    return { from: toISO(days[0]), to: toISO(days[days.length - 1]) };
  }, [view, anchor]);

  // Muat tempahan bagi julat
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ from: range.from, to: range.to });
    if (roomId) params.set("roomId", roomId);
    fetch(`/api/bookings?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setBookings(j.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [range, roomId]);

  // Kumpulkan tempahan ikut tarikh
  const byDate = useMemo(() => {
    const map = new Map<string, BookingWithRoom[]>();
    for (const b of bookings) {
      const list = map.get(b.booking_date) ?? [];
      list.push(b);
      map.set(b.booking_date, list);
    }
    return map;
  }, [bookings]);

  async function cancelBooking(b: BookingWithRoom) {
    const pwd = getAdminPassword();
    if (!pwd) return;
    if (
      !confirm(
        `Batalkan tempahan ${b.rooms?.name ?? ""} (${formatTime(
          b.start_time
        )}–${formatTime(b.end_time)}, ${b.teacher_name})?`
      )
    )
      return;
    setMsg(null);
    const res = await fetch(`/api/bookings/${b.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": pwd },
    });
    if (res.ok) {
      setBookings((prev) => prev.filter((x) => x.id !== b.id));
      setMsg("Tempahan dibatalkan.");
    } else {
      const j = await res.json();
      setMsg(j.error ?? "Gagal membatalkan tempahan.");
    }
  }

  function move(dir: -1 | 1) {
    if (view === "minggu") setAnchor((d) => addDays(startOfWeek(d), dir * 7));
    else setAnchor((d) => addMonths(d, dir));
  }

  const periodLabel =
    view === "minggu"
      ? (() => {
          const days = weekDays(anchor);
          const a = days[0];
          const b = days[6];
          return `${a.getDate()} – ${b.getDate()} ${monthLabel(b)}`;
        })()
      : monthLabel(anchor);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Jadual Tempahan</h1>
      <p className="no-print mt-1 text-sm text-slate-600">
        Lihat keadaan tempahan setiap bilik mengikut minggu atau bulan.
      </p>

      {/* Tajuk untuk cetakan sahaja */}
      <div className="print-only mb-2 mt-1 text-sm text-slate-700">
        Bilik:{" "}
        <strong>
          {roomId
            ? rooms.find((r) => r.id === roomId)?.name ?? "-"
            : "Semua Bilik"}
        </strong>
        {" · "}Paparan: <strong className="capitalize">{view}</strong>
      </div>

      {isAdmin && (
        <p className="no-print mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Mod Pentadbir aktif — anda boleh batalkan mana-mana tempahan.
        </p>
      )}

      {/* Kawalan */}
      <div className="no-print mt-4 flex flex-wrap items-center gap-3">
        {/* Penapis bilik */}
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
        >
          <option value="">Semua Bilik</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        {/* Togol paparan */}
        <div className="inline-flex overflow-hidden rounded-md border border-slate-300">
          {(["minggu", "bulan"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={
                "px-3 py-2 text-sm font-medium capitalize " +
                (view === v
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50")
              }
            >
              {v}
            </button>
          ))}
        </div>

        {/* Navigasi tempoh */}
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => window.print()}
              className="rounded-md border border-brand-600 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
            >
              Cetak
            </button>
          )}
          <button
            onClick={() => move(-1)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            aria-label="Sebelum"
          >
            &larr;
          </button>
          <button
            onClick={() => setAnchor(new Date())}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Hari Ini
          </button>
          <button
            onClick={() => move(1)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            aria-label="Seterus"
          >
            &rarr;
          </button>
        </div>
      </div>

      <h2 className="mt-4 text-sm font-semibold text-slate-700">{periodLabel}</h2>
      {msg && <p className="no-print mt-2 text-sm text-brand-700">{msg}</p>}
      {loading && (
        <p className="no-print mt-2 text-sm text-slate-400">Memuatkan…</p>
      )}

      {view === "minggu" ? (
        <WeekView
          days={weekDays(anchor)}
          byDate={byDate}
          isAdmin={isAdmin}
          onCancel={cancelBooking}
        />
      ) : (
        <MonthView
          anchor={anchor}
          byDate={byDate}
          isAdmin={isAdmin}
          onCancel={cancelBooking}
        />
      )}
    </div>
  );
}

// -------------------- Paparan Minggu --------------------
function WeekView({
  days,
  byDate,
  isAdmin,
  onCancel,
}: {
  days: Date[];
  byDate: Map<string, BookingWithRoom[]>;
  isAdmin: boolean;
  onCancel: (b: BookingWithRoom) => void;
}) {
  const todayISO = toISO(new Date());
  return (
    <div className="week-grid mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((d, i) => {
        const iso = toISO(d);
        const list = byDate.get(iso) ?? [];
        const isToday = iso === todayISO;
        return (
          <div
            key={iso}
            className={
              "avoid-break rounded-lg border bg-white p-2 " +
              (isToday ? "border-brand-600 ring-1 ring-brand-600" : "border-slate-200")
            }
          >
            <div className="mb-2 border-b border-slate-100 pb-1 text-center">
              <p className="text-xs font-medium text-slate-500">{HARI_PENDEK[i]}</p>
              <p className="text-sm font-semibold text-slate-900">{d.getDate()}</p>
            </div>
            {list.length === 0 ? (
              <p className="py-2 text-center text-xs text-slate-300">—</p>
            ) : (
              <ul className="space-y-1">
                {list.map((b) => (
                  <li
                    key={b.id}
                    className="rounded bg-brand-50 px-2 py-1 text-xs text-slate-700"
                  >
                    <span className="font-semibold text-brand-700">
                      {formatTime(b.start_time)}–{formatTime(b.end_time)}
                    </span>
                    <span className="block">{b.rooms?.name}</span>
                    <span className="block text-slate-500">
                      {b.teacher_name} · {b.purpose}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => onCancel(b)}
                        className="mt-1 text-[11px] font-medium text-red-600 hover:underline"
                      >
                        Batal
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

// -------------------- Paparan Bulan --------------------
function MonthView({
  anchor,
  byDate,
  isAdmin,
  onCancel,
}: {
  anchor: Date;
  byDate: Map<string, BookingWithRoom[]>;
  isAdmin: boolean;
  onCancel: (b: BookingWithRoom) => void;
}) {
  const days = monthGridDays(anchor);
  const monthIdx = startOfMonth(anchor).getMonth();
  const lastDay = endOfMonth(anchor).getDate();
  const todayISO = toISO(new Date());

  return (
    <div className="mt-3 overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Tajuk hari */}
        <div className="grid grid-cols-7 gap-px">
          {HARI_PENDEK.map((h) => (
            <div
              key={h}
              className="bg-slate-100 py-1 text-center text-xs font-medium text-slate-600"
            >
              {h}
            </div>
          ))}
        </div>
        {/* Sel hari */}
        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {days.map((d) => {
            const iso = toISO(d);
            const list = byDate.get(iso) ?? [];
            const inMonth = d.getMonth() === monthIdx && d.getDate() <= lastDay;
            const isToday = iso === todayISO;
            return (
              <div
                key={iso}
                className={
                  "avoid-break min-h-[88px] bg-white p-1 align-top " +
                  (inMonth ? "" : "bg-slate-50 text-slate-300")
                }
              >
                <div
                  className={
                    "text-right text-xs " +
                    (isToday
                      ? "font-bold text-brand-700"
                      : inMonth
                        ? "text-slate-500"
                        : "text-slate-300")
                  }
                >
                  {d.getDate()}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {list.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center gap-1 rounded bg-brand-50 px-1 py-0.5 text-[11px] leading-tight text-slate-700"
                      title={`${b.rooms?.name} · ${b.teacher_name} · ${b.purpose}`}
                    >
                      <span className="truncate">
                        <span className="font-semibold text-brand-700">
                          {formatTime(b.start_time)}
                        </span>{" "}
                        {b.rooms?.name}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => onCancel(b)}
                          className="ml-auto shrink-0 text-red-600 hover:font-bold"
                          aria-label="Batal"
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
