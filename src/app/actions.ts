"use server";

import { updateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { romeToUtc, validateOrder, type OrderError } from "@/lib/orders";
import { notifyCustomer } from "@/lib/notify";
import { statuses, type CartLine, type Order, type OrderStatus, type Product } from "@/lib/types";

export type PlaceOrderInput = {
  lines: CartLine[];
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD (ora di Poirino)
  time: string; // HH:MM
  notes: string;
  lang: "it" | "en";
  accessToken?: string; // se il cliente è loggato
};

type Result<T> = { ok: true; data: T } | { ok: false; error: OrderError | "generic" };

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function placeOrder(input: PlaceOrderInput): Promise<Result<{ number: number }>> {
  try {
    const name = clip(input.name, 120);
    const email = clip(input.email, 200) || null;
    const phone = clip(input.phone, 40) || null;
    const notes = clip(input.notes, 1000);
    const lang = input.lang === "en" ? "en" : "it";
    if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) return { ok: false, error: "generic" };
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "contact" };

    // Accorpa righe duplicate e scarta quantità non valide
    const qty = new Map<string, number>();
    for (const l of (Array.isArray(input.lines) ? input.lines : []).slice(0, 50)) {
      const q = Math.floor(Number(l?.quantity));
      if (typeof l?.productId === "string" && q > 0 && q <= 500) qty.set(l.productId, (qty.get(l.productId) ?? 0) + q);
    }

    const db = supabaseAdmin();
    // Prezzi e disponibilità presi sempre dal database, mai dal browser
    const { data: products, error } = await db.from("products").select("*").in("id", [...qty.keys()]).eq("available", true);
    if (error) throw error;
    const items = (products as Product[]).map((p) => ({ p, quantity: qty.get(p.id)! }));
    if (items.length !== qty.size) return { ok: false, error: "generic" }; // prodotto esaurito o rimosso nel frattempo

    const pickupAt = romeToUtc(input.date, input.time);
    const invalid = validateOrder({ items: items.map((i) => ({ quantity: i.quantity, requires_advance: i.p.requires_advance })), email, phone, pickupAt, now: new Date() });
    if (invalid) return { ok: false, error: invalid };

    let userId: string | null = null;
    if (input.accessToken) userId = (await db.auth.getUser(input.accessToken)).data.user?.id ?? null;

    const { data: order, error: oErr } = await db.from("orders").insert({
      user_id: userId, customer_name: name, email, phone, notes, lang,
      pickup_at: pickupAt.toISOString(),
      total_cents: items.reduce((s, i) => s + i.p.price_cents * i.quantity, 0),
    }).select("id, number").single();
    if (oErr) throw oErr;

    const { error: iErr } = await db.from("order_items").insert(items.map((i) => ({
      order_id: order.id, product_id: i.p.id, name: i.p.name_it, unit_price_cents: i.p.price_cents, quantity: i.quantity,
    })));
    if (iErr) {
      await db.from("orders").delete().eq("id", order.id);
      throw iErr;
    }
    return { ok: true, data: { number: order.number } };
  } catch (e) {
    console.error("[placeOrder]", e);
    return { ok: false, error: "generic" };
  }
}

async function requireStaff(accessToken: string) {
  const db = supabaseAdmin();
  const user = (await db.auth.getUser(accessToken)).data.user;
  if (!user) throw new Error("Non autenticato");
  const { data } = await db.from("staff").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) throw new Error("Non autorizzato");
  return db;
}

export async function updateOrderStatus(accessToken: string, orderId: string, status: OrderStatus) {
  if (!statuses.includes(status)) throw new Error("Stato non valido");
  const db = await requireStaff(accessToken);
  const { data, error } = await db.from("orders").update({ status }).eq("id", orderId).select("*").single();
  if (error) throw error;
  await notifyCustomer(data as Order).catch((e) => console.error("[notify]", e)); // l'ordine è già aggiornato: non fallire per la notifica
}

/** Chiamata dalla dashboard dopo ogni modifica ai prodotti, per aggiornare subito il sito. */
export async function refreshCatalog(accessToken: string) {
  await requireStaff(accessToken);
  updateTag("products");
}
