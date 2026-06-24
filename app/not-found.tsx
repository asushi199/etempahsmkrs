import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Halaman Tidak Dijumpai</h1>
      <p className="mt-2 text-sm text-slate-600">
        Bilik atau halaman yang anda cari tidak wujud.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Kembali ke Laman Utama
      </Link>
    </div>
  );
}
