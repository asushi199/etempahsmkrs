import Link from "next/link";
import { getActiveRooms } from "@/lib/data";
import RoomCard from "@/components/RoomCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rooms = await getActiveRooms();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bilik Tersedia
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pilih bilik untuk melihat jadual dan membuat tempahan.
          </p>
        </div>
        {rooms.length > 0 && (
          <span className="hidden shrink-0 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-500 ring-1 ring-inset ring-slate-200 sm:inline-block">
            {rooms.length} bilik
          </span>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Belum ada bilik. Sila tambah bilik di halaman{" "}
          <Link href="/admin" className="font-medium text-brand-700 underline">
            Tetapan
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
