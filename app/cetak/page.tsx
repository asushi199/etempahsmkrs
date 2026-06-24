import Link from "next/link";
import { getActiveRooms, getBookingsForRange, getSettings } from "@/lib/data";
import type { Booking } from "@/lib/types";
import PrintButton from "@/components/PrintButton";
import {
  addDays,
  startOfWeek,
  toISO,
  weekDays,
  HARI_PENDEK,
} from "@/lib/calendar";
import { formatTime, formatDateMalay } from "@/lib/format";

export const dynamic = "force-dynamic";

// Waktu persekolahan 07:45–14:45, slot 30 minit (selari dengan jadual tempahan)
const START = 7 * 60 + 45;
const END = 14 * 60 + 45;
const SLOT = 30;
const SLOTS: number[] = [];
for (let m = START; m < END; m += SLOT) SLOTS.push(m);

function minToTime(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(
    min % 60
  ).padStart(2, "0")}`;
}
function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

type Cell = "empty" | "covered" | { booking: Booking; span: number };

// Bina lajur sehari: untuk setiap slot, tentukan sama ada kosong / diliputi / mula tempahan
function buildDayColumn(list: Booking[]): Cell[] {
  const cells: Cell[] = new Array(SLOTS.length).fill("empty");
  for (const b of list) {
    const s = clamp(Math.round((toMin(b.start_time) - START) / SLOT), 0, SLOTS.length);
    const e = clamp(Math.round((toMin(b.end_time) - START) / SLOT), 0, SLOTS.length);
    if (e <= s) continue;
    cells[s] = { booking: b, span: e - s };
    for (let r = s + 1; r < e; r++) cells[r] = "covered";
  }
  return cells;
}

export default async function CetakPage({
  searchParams,
}: {
  searchParams: Promise<{ minggu?: string; bilik?: string }>;
}) {
  const sp = await searchParams;
  const baseDate =
    sp.minggu && /^\d{4}-\d{2}-\d{2}$/.test(sp.minggu)
      ? new Date(sp.minggu + "T00:00:00")
      : new Date();

  const monday = startOfWeek(baseDate);
  const days = weekDays(monday).slice(0, 5); // Isnin–Jumaat
  const from = toISO(days[0]);
  const to = toISO(days[days.length - 1]);
  const prevWeek = toISO(addDays(monday, -7));
  const nextWeek = toISO(addDays(monday, 7));
  const thisWeek = toISO(startOfWeek(new Date()));
  const weekLabel = `${formatDateMalay(from)} – ${formatDateMalay(to)}`;

  const [settings, allRooms] = await Promise.all([getSettings(), getActiveRooms()]);
  const rooms = sp.bilik
    ? allRooms.filter((r) => r.id === sp.bilik)
    : allRooms;

  const bookings = await getBookingsForRange(from, to, sp.bilik);

  // Kumpulkan: roomId -> isoDate -> Booking[]
  const byRoomDate = new Map<string, Map<string, Booking[]>>();
  for (const b of bookings) {
    const rm = byRoomDate.get(b.room_id) ?? new Map<string, Booking[]>();
    const list = rm.get(b.booking_date) ?? [];
    list.push(b);
    rm.set(b.booking_date, list);
    byRoomDate.set(b.room_id, rm);
  }

  const linkBase = (minggu: string) =>
    `/cetak?minggu=${minggu}${sp.bilik ? `&bilik=${sp.bilik}` : ""}`;

  return (
    <div>
      {/* Bar alat — tidak dicetak */}
      <div className="no-print mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <Link
          href="/tempahan"
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          &larr; Kembali ke Jadual
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={linkBase(prevWeek)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            &larr; Minggu Lalu
          </Link>
          <Link
            href={linkBase(thisWeek)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Minggu Ini
          </Link>
          <Link
            href={linkBase(nextWeek)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Minggu Depan &rarr;
          </Link>
          {sp.bilik && (
            <Link
              href={`/cetak?minggu=${toISO(monday)}`}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            >
              Semua Bilik
            </Link>
          )}
          <PrintButton />
        </div>
      </div>

      <p className="no-print mb-4 text-sm text-slate-500">
        Setiap bilik akan dicetak pada halaman berasingan. Tekan{" "}
        <strong>Cetak Sekarang</strong> dan pilih pencetak atau “Simpan sebagai PDF”.
      </p>

      {rooms.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Tiada bilik untuk dicetak.
        </p>
      ) : (
        rooms.map((room) => {
          const dateMap = byRoomDate.get(room.id) ?? new Map<string, Booking[]>();
          const grid = days.map((d) => buildDayColumn(dateMap.get(toISO(d)) ?? []));
          return (
            <section
              key={room.id}
              className="print-page mb-8 rounded-lg border border-slate-200 bg-white p-5"
            >
              {/* Kepala surat */}
              <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3">
                {settings.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-brand-600 text-sm font-bold text-white">
                    SR
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-brand-800">
                    {settings.system_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Jadual Tempahan Mingguan
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <h2 className="text-xl font-bold text-slate-900">{room.name}</h2>
                <p className="text-sm text-slate-500">Minggu: {weekLabel}</p>
              </div>

              {/* Jadual waktu */}
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="w-24 border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      Masa
                    </th>
                    {days.map((d, i) => (
                      <th
                        key={toISO(d)}
                        className="border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        {HARI_PENDEK[i]}
                        <span className="block text-[10px] font-normal text-slate-500">
                          {d.getDate()}/{d.getMonth() + 1}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map((slot, row) => (
                    <tr key={slot}>
                      <td className="border border-slate-300 bg-slate-50 px-2 py-1 text-center text-[11px] text-slate-500 whitespace-nowrap">
                        {minToTime(slot)}
                        <br />
                        {minToTime(slot + SLOT)}
                      </td>
                      {grid.map((col, dayIdx) => {
                        const cell = col[row];
                        if (cell === "covered") return null;
                        if (cell === "empty")
                          return (
                            <td
                              key={dayIdx}
                              className="h-9 border border-slate-200"
                            />
                          );
                        const b = cell.booking;
                        return (
                          <td
                            key={dayIdx}
                            rowSpan={cell.span}
                            className="border border-slate-300 bg-brand-50 p-1 align-top text-[11px] leading-tight"
                          >
                            <div className="font-semibold text-brand-800">
                              {b.teacher_name}
                            </div>
                            <div className="text-slate-600">{b.purpose}</div>
                            <div className="text-[10px] text-slate-400">
                              {formatTime(b.start_time)}–{formatTime(b.end_time)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })
      )}
    </div>
  );
}
