"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { romeDay } from "@/lib/orders";
import type { Order } from "@/lib/types";

const ranges = [7, 30, 90] as const;

export function Stats() {
  const [days, setDays] = useState<(typeof ranges)[number]>(30);
  const [loaded, setLoaded] = useState<{ orders: Order[]; now: number } | null>(null);

  useEffect(() => {
    const now = Date.now();
    const since = new Date(now - days * 864e5).toISOString();
    supabase().from("orders").select("*, order_items(*)").neq("status", "cancelled").gte("created_at", since).limit(5000)
      .then(({ data }) => setLoaded({ orders: (data as Order[]) ?? [], now }));
  }, [days]);

  const s = useMemo(() => {
    if (!loaded) return null;
    const { orders, now } = loaded;
    const byDay = new Map<string, { revenue: number; count: number }>();
    for (let i = days - 1; i >= 0; i--) byDay.set(romeDay(new Date(now - i * 864e5)), { revenue: 0, count: 0 });
    const byProduct = new Map<string, number>();
    for (const o of orders) {
      const d = byDay.get(romeDay(new Date(o.created_at)));
      if (d) { d.revenue += o.total_cents / 100; d.count++; }
      for (const i of o.order_items ?? []) byProduct.set(i.name, (byProduct.get(i.name) ?? 0) + i.quantity);
    }
    const revenue = orders.reduce((x, o) => x + o.total_cents, 0);
    return {
      revenue, count: orders.length, avg: orders.length ? revenue / orders.length : 0,
      daily: [...byDay].map(([day, v]) => ({ day: day.slice(5).split("-").reverse().join("/"), ...v })),
      top: [...byProduct].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, qty]) => ({ name, qty })),
    };
  }, [loaded, days]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {ranges.map((r) => (
          <button key={r} onClick={() => setDays(r)} className={`rounded-full border px-4 py-2 text-sm ${days === r ? "border-fg bg-fg text-bg" : "border-line hover:bg-soft"}`}>Ultimi {r} giorni</button>
        ))}
      </div>
      {!s ? <p className="text-muted">Caricamento…</p> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Tile label="Incasso ordini online" value={formatPrice(s.revenue, "it")} />
            <Tile label="Ordini" value={String(s.count)} />
            <Tile label="Scontrino medio" value={formatPrice(Math.round(s.avg), "it")} />
          </div>
          <Panel title="Incasso giornaliero (€)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={s.daily} margin={{ left: -12, right: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="day" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={16} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "var(--soft)" }} contentStyle={tooltipStyle}
                  formatter={(v, _n, item) => [`${formatPrice(Math.round(Number(v) * 100), "it")} · ${item.payload.count} ordini`, "Incasso"]} />
                <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Prodotti più venduti (quantità)">
            {s.top.length === 0 ? <p className="text-sm text-muted">Nessun dato nel periodo.</p> : (
              <ResponsiveContainer width="100%" height={Math.max(160, s.top.length * 40)}>
                <BarChart data={s.top} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fill: "var(--fg)", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "var(--soft)" }} contentStyle={tooltipStyle} formatter={(v) => [v, "Quantità"]} />
                  <Bar dataKey="qty" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={18} label={{ position: "right", fill: "var(--muted)", fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
          <p className="text-xs text-muted">Conta solo gli ordini dal sito (esclusi gli annullati), non le vendite al banco.</p>
        </>
      )}
    </div>
  );
}

const tooltipStyle = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--fg)" };

const Tile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-3xl border border-line bg-card p-5"><p className="text-sm text-muted">{label}</p><p className="mt-1 font-serif text-4xl">{value}</p></div>
);
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-3xl border border-line bg-card p-5"><h2 className="mb-4 font-medium">{title}</h2>{children}</section>
);
