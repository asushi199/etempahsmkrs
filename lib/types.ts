// Jenis data dikongsi seluruh aplikasi

export type Room = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  room_id: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  teacher_name: string;
  purpose: string;
  created_at: string;
};

// Tempahan beserta nama bilik (untuk paparan senarai)
export type BookingWithRoom = Booking & {
  rooms: { name: string } | null;
};

export type Settings = {
  id: number;
  system_name: string;
  logo_url: string | null;
};
