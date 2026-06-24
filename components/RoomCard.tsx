import Link from "next/link";
import type { Room } from "@/lib/types";

// Palet warna jujukan — setiap kad dapat tema berbeza ikut kedudukan (index)
// supaya kad bersebelahan tidak kelihatan sama. Kelas ditulis penuh untuk Tailwind.
const PALETTE: { bar: string; chip: string }[] = [
  { bar: "from-sky-400 to-blue-600", chip: "bg-sky-50 text-sky-600 ring-sky-100" },
  { bar: "from-emerald-400 to-emerald-600", chip: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  { bar: "from-violet-400 to-violet-600", chip: "bg-violet-50 text-violet-600 ring-violet-100" },
  { bar: "from-amber-400 to-orange-500", chip: "bg-amber-50 text-amber-600 ring-amber-100" },
  { bar: "from-rose-400 to-rose-600", chip: "bg-rose-50 text-rose-600 ring-rose-100" },
  { bar: "from-teal-400 to-teal-600", chip: "bg-teal-50 text-teal-600 ring-teal-100" },
  { bar: "from-indigo-400 to-indigo-600", chip: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
  { bar: "from-cyan-400 to-cyan-600", chip: "bg-cyan-50 text-cyan-600 ring-cyan-100" },
  { bar: "from-fuchsia-400 to-fuchsia-600", chip: "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100" },
  { bar: "from-lime-400 to-lime-600", chip: "bg-lime-50 text-lime-600 ring-lime-100" },
];

// Ikon mengikut jenis bilik (dikesan dari nama/keterangan)
const ICON_PATHS: Record<string, React.ReactNode> = {
  flask: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v6.5L5.6 16.9A2 2 0 0 0 7.3 20h9.4a2 2 0 0 0 1.7-3.1L14 9.5V3" />
      <path d="M7.7 14h8.6" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  book: (
    <>
      <path d="M5 4a1 1 0 0 1 1-1h11v18H6a1 1 0 0 1-1-1z" />
      <path d="M9 3v16" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 6" />
      <path d="M18.5 19a5.5 5.5 0 0 0-3-4.9" />
    </>
  ),
  tools: (
    <>
      <path d="M14.7 6.3a3.5 3.5 0 0 0 4.6 4.6L21 12l-5.5 5.5a2.1 2.1 0 0 1-3 0l-.5-.5" />
      <path d="M6 8l4 4" />
      <path d="M3 21l6-6" />
      <path d="M3 5l3-2 3 5-3 3-5-3z" />
    </>
  ),
  // Ikon jujukan untuk bilik yang tidak dikenali
  door: (
    <>
      <path d="M6 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17" />
      <path d="M4 21h16" />
      <path d="M13.5 12h.01" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  bookmark: (
    <>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </>
  ),
};

const FALLBACK_ICONS = ["door", "building", "layers", "bookmark"];

function classify(
  name: string,
  description: string | null
): { icon: string; label: string } | null {
  const t = `${name} ${description ?? ""}`.toLowerCase();
  if (t.includes("sains")) return { icon: "flask", label: "Makmal Sains" };
  if (t.includes("komputer") || t.includes("ict") || t.includes("computer"))
    return { icon: "monitor", label: "Makmal Komputer" };
  if (
    t.includes("perpustakaan") ||
    t.includes("pusat sumber") ||
    t.includes("library")
  )
    return { icon: "book", label: "Perpustakaan" };
  if (t.includes("mesyuarat") || t.includes("guru"))
    return { icon: "users", label: "Bilik Mesyuarat" };
  if (t.includes("rbt") || t.includes("reka bentuk") || t.includes("bengkel"))
    return { icon: "tools", label: "Bengkel RBT" };
  return null;
}

function CardIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

export default function RoomCard({
  room,
  index,
}: {
  room: Room;
  index: number;
}) {
  const theme = PALETTE[index % PALETTE.length];
  const sem = classify(room.name, room.description);
  const iconName = sem
    ? sem.icon
    : FALLBACK_ICONS[index % FALLBACK_ICONS.length];
  const label = sem ? sem.label : "Bilik Khas";

  return (
    <Link
      href={`/bilik/${room.id}`}
      className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.05),0_12px_28px_-14px_rgba(15,23,42,0.22)] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-brand-300 group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_8px_16px_rgba(15,23,42,0.06),0_28px_50px_-18px_rgba(29,78,216,0.4)]">
        {/* Jalur aksen atas */}
        <div
          className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.bar}`}
        />

        <div className="flex items-start justify-between">
          <div
            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset shadow-sm transition-transform duration-300 group-hover:scale-105 ${theme.chip}`}
          >
            <CardIcon name={iconName} />
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${theme.chip}`}
          >
            {label}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
          {room.name}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {room.description || "Bilik khas sekolah"}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">Lihat jadual mingguan</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
            Tempah
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
