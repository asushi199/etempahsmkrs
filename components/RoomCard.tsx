import Link from "next/link";
import type { Room } from "@/lib/types";

// Tentukan jenis bilik dari nama untuk pilih ikon + warna aksen
type Kind = "sains" | "komputer" | "mesyuarat" | "perpustakaan" | "lain";

function roomKind(name: string): Kind {
  const n = name.toLowerCase();
  if (n.includes("sains") || n.includes("makmal") && n.includes("sains"))
    return "sains";
  if (n.includes("komputer") || n.includes("ict") || n.includes("computer"))
    return "komputer";
  if (n.includes("mesyuarat") || n.includes("guru")) return "mesyuarat";
  if (n.includes("perpustakaan") || n.includes("library")) return "perpustakaan";
  return "lain";
}

// Kelas warna ditulis penuh supaya dikesan oleh Tailwind (bukan dibina dinamik)
const ACCENT: Record<Kind, { bar: string; chip: string; label: string }> = {
  sains: {
    bar: "from-emerald-400 to-emerald-600",
    chip: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    label: "Makmal Sains",
  },
  komputer: {
    bar: "from-sky-400 to-blue-600",
    chip: "bg-sky-50 text-sky-600 ring-sky-100",
    label: "Makmal Komputer",
  },
  mesyuarat: {
    bar: "from-amber-400 to-orange-500",
    chip: "bg-amber-50 text-amber-600 ring-amber-100",
    label: "Bilik Mesyuarat",
  },
  perpustakaan: {
    bar: "from-violet-400 to-violet-600",
    chip: "bg-violet-50 text-violet-600 ring-violet-100",
    label: "Perpustakaan",
  },
  lain: {
    bar: "from-brand-600 to-brand-800",
    chip: "bg-brand-50 text-brand-600 ring-brand-100",
    label: "Bilik Khas",
  },
};

function RoomIcon({ kind }: { kind: Kind }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6",
  };
  switch (kind) {
    case "sains":
      return (
        <svg {...common}>
          <path d="M9 3h6" />
          <path d="M10 3v6.5L5.6 16.9A2 2 0 0 0 7.3 20h9.4a2 2 0 0 0 1.7-3.1L14 9.5V3" />
          <path d="M7.7 14h8.6" />
        </svg>
      );
    case "komputer":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );
    case "mesyuarat":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16 5.5a3 3 0 0 1 0 6" />
          <path d="M18.5 19a5.5 5.5 0 0 0-3-4.9" />
        </svg>
      );
    case "perpustakaan":
      return (
        <svg {...common}>
          <path d="M5 4a1 1 0 0 1 1-1h11v18H6a1 1 0 0 1-1-1z" />
          <path d="M9 3v16" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M6 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17" />
          <path d="M4 21h16" />
          <path d="M13.5 12h.01" />
        </svg>
      );
  }
}

export default function RoomCard({ room }: { room: Room }) {
  const kind = roomKind(room.name);
  const a = ACCENT[kind];
  return (
    <Link
      href={`/bilik/${room.id}`}
      className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.05),0_12px_28px_-14px_rgba(15,23,42,0.22)] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-brand-300 group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_8px_16px_rgba(15,23,42,0.06),0_28px_50px_-18px_rgba(29,78,216,0.4)]"
      >
        {/* Jalur aksen atas */}
        <div
          className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${a.bar}`}
        />

        <div className="flex items-start justify-between">
          {/* Medalion ikon */}
          <div
            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset shadow-sm transition-transform duration-300 group-hover:scale-105 ${a.chip}`}
          >
            <RoomIcon kind={kind} />
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${a.chip}`}
          >
            {a.label}
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
