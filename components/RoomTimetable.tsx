"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { BookingWithRoom } from "@/lib/types";
import { getAdminPassword } from "@/lib/adminClient";
import { addDays, startOfWeek, toISO, weekDays, monthLabel, HARI_PENDEK } from "@/lib/calendar";
import { todayISO } from "@/lib/format";
import { START_MIN, END_MIN, SLOT, SLOTS, minToTime, timeToMin } from "@/lib/schedule";
import BookingForm from "@/components/BookingForm";

// Susun atur mendatar jadual: masa pada paksi-X, hari pada paksi-Y
const COL_PX = 78;
const ROW_PX = 62;
const LABEL_W = 96;
const TRACK_PX = SLOTS.length * COL_PX;

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
    const params = new URLSearchParams({ from: range.from, to: range.to, roomId });
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
  const today = toISO(new Date());

  function isPast(dateISO: string, startMin: number): boolean {
    if (dateISO < today) return true;
    if (dateISO === today && startMin < nowMin) return true;
    return false;
  }

  function handleBooked() {
    setMsg({ type: "ok", text: "Tempahan berjaya disimpan!" });
    loadBookings();
  }

  async function cancelBooking(b: BookingWithRoom) {
    const pwd = getAdminPassword();
    if (!pwd) return;
    if (
      !confirm(
        `Batalkan tempahan ${minToTime(timeToMin(b.start_time))}–${minToTime(
          timeToMin(b.end_time)
        )} (${b.teacher_name})?`
      )
    )
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
          Mod Pentadbir aktif — ketuk tempahan dalam jadual untuk batalkan.
        </p>
      )}

      {msg && (
        <p
          className={
            msg.type === "ok"
              ? "mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700"
              : "mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600"
          }
        >
          {msg.text}
        </p>
      )}

      {/* Tempah Pantas — terus isi tanpa skrol jadual */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-900">Tempah Pantas</h2>
        <p className="mb-4 mt-0.5 text-xs text-slate-500">
          Isi maklumat di bawah dan tekan Tempah — tanpa perlu skrol jadual.
        </p>
        <BookingForm
          roomId={roomId}
          initialDate={todayISO()}
          initialStartMin={START_MIN}
          onSuccess={handleBooked}
        />
      </section>

      {/* Jadual mingguan */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-slate-900">Jadual Minggu</h2>
        <span className="text-sm text-slate-500">{weekLabel}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setAnchor((d) => addDays(startOfWeek(d), -7))}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm hover:bg-slate-50"
            aria-label="Minggu lalu"
          >
            &larr;
          </button>
          <button
            onClick={() => setAnchor(new Date())}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm hover:bg-slate-50"
          >
            Kini
          </button>
          <button
            onClick={() => setAnchor((d) => addDays(startOfWeek(d), 7))}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm hover:bg-slate-50"
            aria-label="Minggu depan"
          >
            &rarr;
          </button>
        </div>
      </div>

      {loading && <p className="mb-2 text-sm text-slate-400">Memuatkan…</p>}

      {/* Jadual waktu (mendatar) */}
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
            const isToday = iso === today;
            const list = byDate.get(iso) ?? [];
            return (
              <div key={iso} className="flex border-b border-slate-100 last:border-b-0">
                {/* Label hari (beku) */}
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
                          (past ? "cursor-not-allowed bg-slate-50" : "hover:bg-brand-50")
                        }
                        style={{ left: i * COL_PX, width: COL_PX }}
                        aria-label={`Tempah ${minToTime(m)} pada ${iso}`}
                      />
                    );
                  })}

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
                        <span className="block truncate text-brand-700">{b.purpose}</span>
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
        Tip: ketuk mana-mana petak kosong dalam jadual untuk tempah pada masa itu.
      </p>

      {/* Modal apabila petak diklik — guna borang yang sama */}
      {pick && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          onClick={() => setPick(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Tempah {roomName}
            </h3>
            <p className="mb-4 mt-0.5 text-sm text-slate-500">{pick.dateISO}</p>
            <BookingForm
              roomId={roomId}
              initialDate={pick.dateISO}
              initialStartMin={pick.startMin}
              showDate={false}
              submitLabel="Tempah"
              onSuccess={() => {
                setPick(null);
                handleBooked();
              }}
              onCancel={() => setPick(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
