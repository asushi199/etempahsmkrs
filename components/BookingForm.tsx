"use client";

import { useState } from "react";
import {
  GRID_TIMES,
  END_MIN,
  SLOT,
  minToTime,
  timeToMin,
} from "@/lib/schedule";
import { todayISO } from "@/lib/format";

// Borang tempahan dikongsi — digunakan sebagai "Tempah Pantas" (inline) dan
// dalam modal apabila petak jadual diklik.
export default function BookingForm({
  roomId,
  initialDate,
  initialStartMin,
  showDate = true,
  submitLabel = "Tempah Sekarang",
  onSuccess,
  onCancel,
}: {
  roomId: string;
  initialDate: string;
  initialStartMin: number;
  showDate?: boolean;
  submitLabel?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(minToTime(initialStartMin));
  const [endTime, setEndTime] = useState(
    minToTime(Math.min(initialStartMin + SLOT, END_MIN))
  );
  const [teacherName, setTeacherName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (timeToMin(endTime) <= timeToMin(startTime)) {
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
          date,
          startTime,
          endTime,
          teacherName: teacherName.trim(),
          purpose: purpose.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error ?? "Tempahan gagal.");
      } else {
        setTeacherName("");
        setPurpose("");
        onSuccess();
      }
    } catch {
      setErr("Ralat rangkaian. Sila cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

  return (
    <form onSubmit={submit} className="space-y-3">
      {showDate && (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Tarikh
          </label>
          <input
            type="date"
            required
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </div>
      )}

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
              if (timeToMin(endTime) <= timeToMin(v)) {
                setEndTime(minToTime(Math.min(timeToMin(v) + SLOT, END_MIN)));
              }
            }}
            className={field}
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
            className={field}
          >
            {GRID_TIMES.filter((m) => m > timeToMin(startTime)).map((m) => (
              <option key={m} value={minToTime(m)}>
                {minToTime(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Nama Guru
        </label>
        <input
          type="text"
          required
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          placeholder="cth: Cikgu Ahmad"
          className={field}
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
          className={field}
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "Menyimpan…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
