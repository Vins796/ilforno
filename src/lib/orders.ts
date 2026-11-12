// Regole degli ordini, pure e testabili (vedi orders.test.ts).

export const TZ = "Europe/Rome";
/** Oltre questa quantità totale di pezzi l'ordine va fatto il giorno prima. */
export const LARGE_ORDER_QTY = 20;

/** "2026-11-12" + "08:30" (ora di Poirino) → Date UTC corretta, anche col cambio d'ora. */
export function romeToUtc(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date(guess)).map((p) => [p.type, p.value]),
  );
  const asRome = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess - (asRome - guess));
}

/** Giorno di calendario a Poirino, "YYYY-MM-DD". */
export const romeDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);

export type OrderError = "empty" | "contact" | "past" | "advance";

export function validateOrder(o: {
  items: { quantity: number; requires_advance: boolean }[];
  email?: string | null;
  phone?: string | null;
  pickupAt: Date;
  now: Date;
}): OrderError | null {
  if (o.items.length === 0) return "empty";
  if (!o.email?.trim() && !o.phone?.trim()) return "contact";
  if (!(o.pickupAt.getTime() > o.now.getTime())) return "past";
  const qty = o.items.reduce((s, i) => s + i.quantity, 0);
  const needsAdvance = o.items.some((i) => i.requires_advance) || qty > LARGE_ORDER_QTY;
  if (needsAdvance && romeDay(o.pickupAt) <= romeDay(o.now)) return "advance";
  return null;
}
