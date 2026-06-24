// Fungsi pembantu format masa & tarikh (paparan Bahasa Melayu)

// "14:30:00" -> "02:30 PG/PTG" ringkas: pulangkan "14:30"
export function formatTime(t: string): string {
  return t.slice(0, 5);
}

// Tarikh hari ini dalam format YYYY-MM-DD mengikut waktu tempatan
export function todayISO(): string {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

const HARI = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

// "2026-06-24" -> "Rabu, 24 Jun 2026"
export function formatDateMalay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${HARI[date.getDay()]}, ${d} ${BULAN[m - 1]} ${y}`;
}
