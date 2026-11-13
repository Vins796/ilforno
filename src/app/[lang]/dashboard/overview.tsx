"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { dictionaries, formatPrice } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { TZ } from "@/lib/orders";
import type { OrderStatus, Product } from "@/lib/types";
import { ProductImage } from "@/components/product-card";
import { fmtWhen, LiveBadge, useLiveOrders, type Tab } from "./app";
import { Panel, Tile, tooltipStyle, useStats } from "./stats";

const st = dictionaries.it.status;
const cat = dictionaries.it.categories;
const greeting = () => { const h = new Date().getHours(); return h < 13 ? "Buongiorno!" : h < 18 ? "Buon pomeriggio!" : "Buonasera!"; };
const active: OrderStatus[] = ["received", "preparing", "ready"];

/** Pagina iniziale dello staff: un colpo d'occhio su ordini, chicche della settimana e andamento. */
export function Overview({ go }: { go: (t: Tab) => void }) {
  const { orders, live } = useLiveOrders();
  const stats = useStats(7);
  const [specials, setSpecials] = useState<Product[] | null>(null);

  useEffect(() => {
    supabase().from("products").select("*").eq("weekly_special", true).order("sort")
      .then(({ data }) => setSpecials((data as Product[]) ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">{greeting()}</h1>
          <p className="mt-1 text-muted first-letter:uppercase" suppressHydrationWarning>
            {new Date().toLocaleDateString("it-IT", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <LiveBadge live={live} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {active.map((status) => {
          const list = orders.filter((o) => o.status === status);
          return (
            <button key={status} onClick={() => go("orders")} className="group rounded-3xl border border-line bg-card p-5 text-left hover:border-accent/50">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted">{st[status]}</p>
                <span className="text-sm text-accent opacity-0 transition group-hover:opacity-100" aria-hidden>Apri →</span>
              </div>
              <p className="mt-1 font-serif text-5xl">{list.length}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {list.slice(0, 3).map((o) => (
                  <li key={o.id} className="flex justify-between gap-2">
                    <span className="truncate">#{o.number} · {o.customer_name}</span>
                    <span className="shrink-0 text-muted">{fmtWhen(o.pickup_at)}</span>
                  </li>
                ))}
                {list.length > 3 && <li className="text-muted">e altri {list.length - 3}…</li>}
                {list.length === 0 && <li className="text-muted">Nessun ordine</li>}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Chicche della settimana">
          {specials === null ? <p className="text-sm text-muted">Caricamento…</p> : specials.length === 0 ? (
            <p className="text-sm text-muted">Nessuna chicca scelta: segnane qualcuna in Prodotti.</p>
          ) : (
            <ul className="space-y-3">
              {specials.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <ProductImage product={p} className="h-12 w-12 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name_it}</p>
                    <p className="text-sm text-muted">{cat[p.category]} · {formatPrice(p.price_cents, "it")} / {p.unit_it}</p>
                  </div>
                  {!p.available && <span className="rounded-full bg-soft px-2.5 py-1 text-xs text-muted">Esaurito</span>}
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => go("products")} className="mt-4 text-sm font-medium text-accent hover:underline">Gestisci prodotti →</button>
        </Panel>

        <Panel title="Ultimi 7 giorni">
          {!stats ? <p className="text-sm text-muted">Caricamento…</p> : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Tile label="Incasso online" value={formatPrice(stats.revenue, "it")} />
                <Tile label="Ordini" value={String(stats.count)} />
              </div>
              <div className="mt-4 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.daily} margin={{ left: 0, right: 0 }}>
                    <XAxis dataKey="day" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "var(--soft)" }} contentStyle={tooltipStyle}
                      formatter={(v, _n, item) => [`${formatPrice(Math.round(Number(v) * 100), "it")} · ${item.payload.count} ordini`, "Incasso"]} />
                    <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          <button onClick={() => go("stats")} className="mt-4 text-sm font-medium text-accent hover:underline">Vedi andamento →</button>
        </Panel>
      </div>
    </div>
  );
}
