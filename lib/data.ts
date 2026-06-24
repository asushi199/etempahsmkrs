import { supabaseAdmin } from "./supabase";
import type { Booking, BookingWithRoom, Room, Settings } from "./types";

// Fungsi bacaan data sisi-pelayan (digunakan dalam Server Components).

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !data) {
    // Nilai lalai jika tetapan belum wujud
    return { id: 1, system_name: "e-Tempah Bilik SMKRS", logo_url: null };
  }
  return data as Settings;
}

export async function getActiveRooms(): Promise<Room[]> {
  const { data, error } = await supabaseAdmin
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Room[];
}

export async function getRoomById(id: string): Promise<Room | null> {
  const { data } = await supabaseAdmin
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Room) ?? null;
}

export async function getBookingsForRoomDate(
  roomId: string,
  date: string
): Promise<Booking[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("room_id", roomId)
    .eq("booking_date", date)
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function getBookingsForDate(
  date: string
): Promise<BookingWithRoom[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*, rooms(name)")
    .eq("booking_date", date)
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BookingWithRoom[];
}
