import Link from "next/link";
import type { Settings } from "@/lib/types";
import { DesktopNav } from "@/components/Nav";

// Pengepala ringkas — logo + nama dalam satu baris. Pautan navigasi di kanan
// (desktop) atau di bar bawah (telefon, lihat BottomNav).
export default function SiteHeader({ settings }: { settings: Settings }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url}
              alt="Logo sekolah"
              className="h-9 w-9 shrink-0 rounded object-contain"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-brand-600 text-xs font-bold text-white">
              SR
            </div>
          )}
          <span className="truncate text-base font-semibold text-brand-800">
            {settings.system_name}
          </span>
        </Link>
        <div className="ml-auto shrink-0">
          <DesktopNav />
        </div>
      </div>
    </header>
  );
}
