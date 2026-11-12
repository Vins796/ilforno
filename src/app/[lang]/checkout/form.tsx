"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dictionaries, formatPrice, type Lang } from "@/lib/i18n";
import { romeDay } from "@/lib/orders";
import { useSession } from "@/lib/use-session";
import { useCart } from "@/components/cart";
import { Qty } from "@/components/header";
import { placeOrder } from "../../actions";

export function CheckoutForm({ lang }: { lang: Lang }) {
  const t = dictionaries[lang].checkout;
  const cart = useCart();
  const session = useSession();
  const [today, setToday] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data calcolata nel browser, non nel prerender
  useEffect(() => setToday(romeDay(new Date())), []);

  if (done !== null)
    return (
      <Shell>
        <div className="rounded-3xl border border-line bg-card p-10 text-center">
          <p className="text-5xl">🥖</p>
          <h1 className="mt-4 font-serif text-4xl">{t.success}</h1>
          <p className="mt-4 text-muted">{t.successBody} <strong className="text-fg">#{done}</strong></p>
          <Link href={`/${lang}`} className="btn-primary mt-8">Il Forno</Link>
        </div>
      </Shell>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    if (!get("email").trim() && !get("phone").trim()) return setError(t.errors.contact);
    setSending(true);
    setError(null);
    const res = await placeOrder({
      lines: cart.lines, name: get("name"), email: get("email"), phone: get("phone"),
      date: get("date"), time: get("time"), notes: get("notes"), lang, accessToken: session?.access_token,
    });
    setSending(false);
    if (res.ok) { cart.clear(); setDone(res.data.number); }
    else setError(t.errors[res.error]);
  }

  const meta = session?.user.user_metadata as { name?: string } | undefined;

  return (
    <Shell>
      <h1 className="font-serif text-5xl">{t.title}</h1>
      <p className="mt-3 text-muted">{t.pickupOnly} · {t.payOnPickup}</p>
      <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm">{t.disclaimer}</div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-4" key={session?.user.id ?? "guest"}>
          {session === null && (
            <p className="text-sm text-muted">
              {t.guest} <Link href={`/${lang}/account?next=checkout`} className="text-accent underline">{t.login}</Link>
            </p>
          )}
          <Field label={t.name}><input name="name" required autoComplete="name" defaultValue={meta?.name} className="field" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.email}><input name="email" type="email" autoComplete="email" defaultValue={session?.user.email} className="field" /></Field>
            <Field label={t.phone}><input name="phone" type="tel" autoComplete="tel" className="field" /></Field>
          </div>
          <p className="text-xs text-muted">{t.contactHint}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.date}><input name="date" type="date" required min={today} defaultValue={today} className="field" /></Field>
            <Field label={t.time}><input name="time" type="time" required min="06:30" max="19:30" step={900} defaultValue="12:00" className="field" /></Field>
          </div>
          <Field label={t.notes}><textarea name="notes" rows={3} className="field" /></Field>
          {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
          <button disabled={sending || cart.lines.length === 0} className="btn-primary w-full sm:w-auto">{sending ? t.sending : t.submit}</button>
        </form>

        <aside className="h-fit rounded-3xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl">{dictionaries[lang].cart.title}</h2>
          {cart.lines.length === 0 ? <p className="mt-4 text-muted">{dictionaries[lang].cart.empty}</p> : (
            <ul className="mt-4 space-y-3">
              {cart.lines.map((l) => {
                const p = cart.products.find((p) => p.id === l.productId);
                return p && (
                  <li key={l.productId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 flex-1 truncate">{lang === "it" ? p.name_it : p.name_en}</span>
                    <Qty value={l.quantity} onChange={(q) => cart.setQty(l.productId, q)} />
                    <span className="w-16 text-right tabular-nums">{formatPrice(p.price_cents * l.quantity, lang)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-6 flex justify-between border-t border-line pt-4 text-lg">
            <span>{dictionaries[lang].cart.total}</span><span className="font-semibold">{formatPrice(cart.totalCents, lang)}</span>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

const Shell = ({ children }: { children: React.ReactNode }) => <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">{children}</div>;

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm"><span className="font-medium">{label}</span>{children}</label>;
}
