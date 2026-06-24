import Link from "next/link";
import type { Settings } from "@/lib/types";

// Pengepala (header) berjenama — papar logo sekolah + nama sistem.
export default function SiteHeader({ settings }: { settings: Settings }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url}
              alt="Logo sekolah"
              className="h-10 w-10 rounded object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-600 text-sm font-bold text-white">
              SR
            </div>
          )}
          <span className="text-lg font-semibold text-brand-800">
            {settings.system_name}
          </span>
        </Link>
        <nav className="no-print flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand-700">
            Bilik
          </Link>
          <Link href="/tempahan" className="hover:text-brand-700">
            Jadual Tempahan
          </Link>
          <Link href="/admin" className="hover:text-brand-700">
            Tetapan
          </Link>
        </nav>
      </div>
    </header>
  );
}
