// Fungsi pembantu kalendar (minggu/bulan). Minggu bermula pada hari Isnin.

export function toISO(d: Date): string {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

// Isnin sebagai hari pertama minggu
export function startOfWeek(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (r.getDay() + 6) % 7; // Isnin = 0 ... Ahad = 6
  r.setDate(r.getDate() - day);
  return r;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

// Senarai 7 hari bermula Isnin untuk minggu yang mengandungi 'd'
export function weekDays(d: Date): Date[] {
  const start = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Grid bulan: barisan penuh Isnin–Ahad meliputi keseluruhan bulan
export function monthGridDays(d: Date): Date[] {
  const start = startOfWeek(startOfMonth(d));
  const end = endOfMonth(d);
  const days: Date[] = [];
  let cur = start;
  // Teruskan sehingga melepasi hujung bulan dan lengkapkan minggu terakhir
  while (cur <= end || days.length % 7 !== 0) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

export const HARI_PENDEK = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
const BULAN = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

export function monthLabel(d: Date): string {
  return `${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
