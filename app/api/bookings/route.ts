import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/bookings
//   Mod tarikh tunggal: ?roomId=...&date=YYYY-MM-DD  (untuk borang tempahan)
//   Mod julat (minggu/bulan): ?from=YYYY-MM-DD&to=YYYY-MM-DD[&roomId=...]
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabaseAdmin.from("bookings").select("*, rooms(name)");

  if (date) {
    // Mod tarikh tunggal (perlu roomId)
    if (!roomId) {
      return NextResponse.json(
        { error: "Parameter roomId diperlukan untuk mod tarikh." },
        { status: 400 }
      );
    }
    query = query.eq("room_id", roomId).eq("booking_date", date);
  } else if (from && to) {
    // Mod julat tarikh
    query = query.gte("booking_date", from).lte("booking_date", to);
    if (roomId) query = query.eq("room_id", roomId);
  } else {
    return NextResponse.json(
      { error: "Berikan (roomId & date) atau (from & to)." },
      { status: 400 }
    );
  }

  const { data, error } = await query
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ bookings: data ?? [] });
}

// POST /api/bookings  -> cipta tempahan baharu (dengan semakan pertindihan)
export async function POST(req: Request) {
  let body: {
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    teacherName?: string;
    purpose?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const { roomId, date, startTime, endTime, teacherName, purpose } = body;

  if (!roomId || !date || !startTime || !endTime || !teacherName || !purpose) {
    return NextResponse.json(
      { error: "Sila lengkapkan semua maklumat tempahan." },
      { status: 400 }
    );
  }

  if (endTime <= startTime) {
    return NextResponse.json(
      { error: "Masa tamat mesti selepas masa mula." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert({
      room_id: roomId,
      booking_date: date,
      start_time: startTime,
      end_time: endTime,
      teacher_name: teacherName,
      purpose,
    })
    .select()
    .single();

  if (error) {
    // 23P01 = exclusion_violation (slot bertindih), 23514 = check_violation
    if (error.code === "23P01") {
      return NextResponse.json(
        { error: "Maaf, slot masa ini telah ditempah. Sila pilih masa lain." },
        { status: 409 }
      );
    }
    if (error.code === "23514") {
      return NextResponse.json(
        { error: "Masa tamat mesti selepas masa mula." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data }, { status: 201 });
}
