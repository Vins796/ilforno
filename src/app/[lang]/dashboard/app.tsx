"use client";

import { startTransition, useCallback, useEffect, useRef, useState, ViewTransition } from "react";
import { dictionaries, formatPrice } from "@/lib/i18n";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useSession } from "@/lib/use-session";
import { TZ } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/types";
import { AuthForm } from "@/components/auth-form";
import { Icon, Logo, ThemeToggle } from "@/components/header";
import { toast, Toaster } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { updateOrderStatus } from "../../actions";
import { Products } from "./products";
import { Stats } from "./stats";
import { Overview } from "./overview";

const st = dictionaries.it.status;
const tabs = [["home", "Panoramica"], ["orders", "Ordini"], ["products", "Prodotti"], ["stats", "Andamento"]] as const;
export type Tab = (typeof tabs)[number][0];

export function DashboardApp() {
  const session = useSession();
  const [staff, setStaff] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("home");

  useEffect(() => {
    if (!session) return;
    supabase().from("staff").select("user_id").eq("user_id", session.user.id).maybeSingle().then(({ data }) => setStaff(!!data));
  }, [session]);

  if (!supabaseConfigured) return <Center>Supabase non configurato: vedi README.</Center>;
  if (session === undefined || (session && staff === null)) return <Center>Caricamento…</Center>;
  if (!session) return <div className="py-16"><AuthForm lang="it" allowSignup={false} /></div>;
  if (!staff)
    return (
      <Center>
        Questo account non è abilitato alla dashboard.{" "}
        <button className="text-accent underline" onClick={() => supabase().auth.signOut()}>Esci</button>
      </Center>
    );

  const token = session.access_token;
  return (
    <div className="min-h-dvh">
      <Toaster />
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 px-4 sm:h-16 sm:flex-nowrap sm:px-6">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- cambio di layout radice: serve un caricamento completo per il tema */}
          <a href="/it" className="py-3 sm:py-0"><Logo size={48} /></a>
          {/* Come il menu del sito: voce attiva con la linetta colorata appoggiata sul bordo dell'header */}
          <nav className="order-last flex w-full gap-5 self-stretch font-serif text-[17px] tracking-tight sm:order-none sm:ml-8 sm:w-auto sm:gap-7">
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => startTransition(() => setTab(id))} aria-current={tab === id ? "page" : undefined}
                className={`relative flex shrink-0 items-center py-3 hover:text-fg sm:py-0 ${tab === id ? "text-fg" : "text-muted"}`}>
                {label}
                <span aria-hidden className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent transition-transform duration-300 ${tab === id ? "scale-x-100" : "scale-x-0"}`} />
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle lang="it" />
            <button onClick={() => supabase().auth.signOut()} className="rounded-full p-2 text-muted hover:bg-soft hover:text-fg" aria-label="Esci dall'account" title="Esci">
              <Icon d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" />
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <ViewTransition key={tab} enter="pop" exit="pop" default="none">
          <div>
            {tab === "home" && <Overview go={(t) => startTransition(() => setTab(t))} />}
            {tab === "orders" && <Orders token={token} />}
            {tab === "products" && <Products token={token} />}
            {tab === "stats" && <Stats />}
          </div>
        </ViewTransition>
      </div>
    </div>
  );
}

const Center = ({ children }: { children: React.ReactNode }) => <div className="grid min-h-[60dvh] place-items-center p-6 text-center text-muted"><p>{children}</p></div>;

const next: Partial<Record<OrderStatus, [OrderStatus, string]>> = {
  received: ["preparing", "Prendi in carico"],
  preparing: ["ready", "Segna pronto"],
  ready: ["picked_up", "Ritirato"],
};
const columns: OrderStatus[] = ["received", "preparing", "ready"];

/** Ordini attivi e degli ultimi 2 giorni, aggiornati in tempo reale (con suono per i nuovi). Usato da Panoramica e Ordini. */
export function useLiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [live, setLive] = useState(false);
  const known = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    const since = new Date(Date.now() - 2 * 864e5).toISOString();
    const { data } = await supabase().from("orders").select("*, order_items(*)")
      .or(`status.in.(received,preparing,ready),pickup_at.gte.${since}`).order("pickup_at").limit(300);
    const list = (data as Order[]) ?? [];
    if (known.current && list.some((o) => !known.current!.has(o.id))) alertNewOrder();
    known.current = new Set(list.map((o) => o.id));
    // In una transition: le schede degli ordini scivolano da una colonna all'altra
    startTransition(() => setOrders(list));
  }, []);

  useEffect(() => {
     
    load();
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    let timer: ReturnType<typeof setTimeout>;
    // Ricarica a ogni cambiamento; il ritardo lascia al server il tempo di salvare anche le righe dell'ordine
    const channel = supabase().channel(`orders-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => { clearTimeout(timer); timer = setTimeout(load, 700); })
      .subscribe((s) => setLive(s === "SUBSCRIBED"));
    const onFocus = () => load(); // es. tablet uscito dallo standby
    window.addEventListener("focus", onFocus);
    return () => { clearTimeout(timer); supabase().removeChannel(channel); window.removeEventListener("focus", onFocus); };
  }, [load]);

  return { orders, live, load };
}

export const LiveBadge = ({ live }: { live: boolean }) => (
  <span className="flex items-center gap-2 text-sm text-muted">
    <span className={`h-2.5 w-2.5 rounded-full ${live ? "bg-green-500" : "bg-neutral-400"}`} />
    {live ? "In tempo reale" : "Connessione…"}
  </span>
);

function Orders({ token }: { token: string }) {
  const { orders, live, load } = useLiveOrders();
  const [busy, setBusy] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Order | null>(null);

  async function move(o: Order, status: OrderStatus) {
    setBusy(o.id);
    try {
      await updateOrderStatus(token, o.id, status);
      await load();
      toast(`Ordine #${o.number}: ${st[status].toLowerCase()}`);
    } catch (e) {
      toast(`Ordine #${o.number} non aggiornato: ${(e as Error).message}`, true);
    } finally {
      setBusy(null);
    }
  }

  const done = orders.filter((o) => o.status === "picked_up" || o.status === "cancelled").reverse();

  return (
    <>
      <div className="mb-5"><LiveBadge live={live} /></div>
      <div className="grid gap-5 lg:grid-cols-3">
        {columns.map((c) => {
          const list = orders.filter((o) => o.status === c);
          return (
            <section key={c} className="rounded-3xl bg-soft p-3">
              <h2 className="flex items-center justify-between px-2 py-2 font-medium">{st[c]} <span className="rounded-full bg-card px-2.5 text-sm">{list.length}</span></h2>
              <div className="space-y-3">
                {list.map((o) => (
                  <ViewTransition key={o.id} name={`ordine-${o.id}`} enter="pop" exit="pop">
                    <div><OrderCard o={o} busy={busy === o.id} onMove={(s) => s === "cancelled" ? startTransition(() => setCancelling(o)) : move(o, s)} /></div>
                  </ViewTransition>
                ))}
                {list.length === 0 && <p className="animate-in px-2 py-6 text-center text-sm text-muted">Nessun ordine</p>}
              </div>
            </section>
          );
        })}
      </div>
      {done.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-muted">Completati e annullati (ultimi 2 giorni): {done.length}</summary>
          <ul className="animate-in mt-3 divide-y divide-line rounded-2xl border border-line bg-card text-sm">
            {done.map((o) => (
              <li key={o.id} className="flex flex-wrap justify-between gap-2 px-4 py-3">
                <span>#{o.number} · {o.customer_name}</span>
                <span className="text-muted">{fmtWhen(o.pickup_at)} · {st[o.status]} · {formatPrice(o.total_cents, "it")}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {cancelling && (
        <ViewTransition enter="pop" exit="pop" default="none">
          <ConfirmDialog title={`Annullare l'ordine #${cancelling.number}?`}
            body={`${cancelling.customer_name} riceverà un avviso. L'ordine non si potrà più riattivare.`}
            confirmLabel="Annulla ordine" cancelLabel="Indietro"
            onCancel={() => startTransition(() => setCancelling(null))}
            onConfirm={async () => { await move(cancelling, "cancelled"); startTransition(() => setCancelling(null)); }} />
        </ViewTransition>
      )}
    </>
  );
}

function OrderCard({ o, busy, onMove }: { o: Order; busy: boolean; onMove: (s: OrderStatus) => void }) {
  const n = next[o.status];
  return (
    <article className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">#{o.number} · {o.customer_name}</p>
          <p className="text-sm text-muted">{o.phone ? <a href={`tel:${o.phone}`} className="underline">{o.phone}</a> : o.email}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">{fmtWhen(o.pickup_at)}</span>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {o.order_items?.map((i) => <li key={i.id}><strong>{i.quantity}×</strong> {i.name}</li>)}
      </ul>
      {o.notes && <p className="mt-3 rounded-xl bg-soft p-2 text-sm">📝 {o.notes}</p>}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-medium">{formatPrice(o.total_cents, "it")}</span>
        <div className="flex gap-2">
          <button disabled={busy} onClick={() => onMove("cancelled")} className="rounded-full px-3 py-2 text-xs text-muted hover:bg-soft">Annulla</button>
          {n && <button disabled={busy} onClick={() => onMove(n[0])} className="btn-primary px-4 py-2 text-xs">{busy ? "…" : n[1]}</button>}
        </div>
      </div>
    </article>
  );
}

export const fmtWhen = (iso: string) => {
  const d = new Date(iso);
  const sameDay = (a: Date, b: Date) => a.toLocaleDateString("it-IT", { timeZone: TZ }) === b.toLocaleDateString("it-IT", { timeZone: TZ });
  const time = d.toLocaleTimeString("it-IT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  return sameDay(d, new Date()) ? `oggi ${time}` : `${d.toLocaleDateString("it-IT", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" })} ${time}`;
};

function alertNewOrder() {
  try {
    const ctx = new AudioContext();
    [0, 0.18].forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.15);
    });
  } catch {}
  if ("Notification" in window && Notification.permission === "granted") new Notification("Il Forno · Nuovo ordine!");
}
