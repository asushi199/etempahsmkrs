import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoomById } from "@/lib/data";
import RoomTimetable from "@/components/RoomTimetable";

export const dynamic = "force-dynamic";

export default async function RoomBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room || !room.is_active) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        &larr; Kembali ke senarai bilik
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{room.name}</h1>
        {room.description && (
          <p className="mt-1 text-sm text-slate-600">{room.description}</p>
        )}
      </div>

      <RoomTimetable roomId={room.id} roomName={room.name} />
    </div>
  );
}
