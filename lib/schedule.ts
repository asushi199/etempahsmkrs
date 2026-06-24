// Pemalar & pembantu masa jadual (dikongsi borang tempahan + jadual waktu).
// Waktu persekolahan: 07:45 – 14:45, slot 30 minit.

export const START_MIN = 7 * 60 + 45; // 465
export const END_MIN = 14 * 60 + 45; // 885
export const SLOT = 30;

// Slot mula (07:45 … 14:15) — untuk grid jadual
export const SLOTS: number[] = [];
for (let m = START_MIN; m < END_MIN; m += SLOT) SLOTS.push(m);

// Semua titik masa (termasuk 14:45) — untuk pilihan dropdown borang
export const GRID_TIMES: number[] = [];
for (let m = START_MIN; m <= END_MIN; m += SLOT) GRID_TIMES.push(m);

export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
