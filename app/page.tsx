import Link from "next/link";
import { getActiveRooms } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rooms = await getActiveRooms();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Bilik Tersedia</h1>
        <p className="mt-1 text-sm text-slate-600">
          Pilih bilik untuk membuat tempahan.
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Belum ada bilik. Sila tambah bilik di halaman{" "}
          <Link href="/admin" className="font-medium text-brand-700 underline">
            Tetapan
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/bilik/${room.id}`}
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-600 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                {room.name}
              </h2>
              {room.description && (
                <p className="mt-1 text-sm text-slate-500">{room.description}</p>
              )}
              <span className="mt-4 inline-block text-sm font-medium text-brand-600">
                Tempah &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
