"use client";

import Link from "next/link";
import { startTransition, useEffect, useState, ViewTransition } from "react";
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
        <ViewTransition enter="pop" default="none">
        <div className="rounded-3xl border border-line bg-card p-10 text-center">
          <p className="text-5xl">🥖</p>
          <h1 className="mt-4 font-serif text-4xl">{t.success}</h1>
          <p className="mt-4 text-muted">{t.successBody} <strong className="text-fg">#{done}</strong></p>
          <Link href={`/${lang}`} className="btn-primary mt-8">Il Forno</Link>
        </div>
        </ViewTransition>
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
    // In una transition: il modulo sfuma e compare la conferma
    if (res.ok) startTransition(() => { cart.clear(); setDone(res.data.number); });
    else setError(t.errors[res.error]);
  }

  const meta = session?.user.user_metadata as { name?: string } | undefined;

  return (
    <Shell>
      <ViewTransition exit="pop" default="none">
      <div>
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl sm:text-5xl">{t.title}</h1>
        <p className="mt-3 text-muted">{t.pickupOnly} · {t.payOnPickup}</p>
      </header>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <form onSubmit={submit} className="rounded-3xl border border-line bg-card p-6 sm:p-8" key={session?.user.id ?? "guest"}>
          {session === null && (
            <p className="mb-8 rounded-2xl bg-soft px-4 py-3 text-sm text-muted">
              {t.guest} <Link href={`/${lang}/account?next=checkout`} className="font-medium text-accent underline underline-offset-4">{t.login}</Link>
            </p>
          )}

          <fieldset className="space-y-5">
            <legend className="mb-5 font-serif text-2xl">{t.sectionYou}</legend>
            <Field label={t.name}><input name="name" required autoComplete="name" defaultValue={meta?.name} className="field" /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.email}><input name="email" type="email" autoComplete="email" defaultValue={session?.user.email} className="field" /></Field>
              <Field label={t.phone}><input name="phone" type="tel" autoComplete="tel" className="field" /></Field>
            </div>
            <p className="text-xs leading-relaxed text-muted">{t.contactHint}</p>
          </fieldset>

          <fieldset className="mt-8 space-y-5 border-t border-line pt-8">
            <legend className="sr-only">{t.sectionPickup}</legend>
            <h2 className="font-serif text-2xl" aria-hidden>{t.sectionPickup}</h2>
            <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-relaxed">{t.disclaimer}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.date}><input name="date" type="date" required min={today} defaultValue={today} className="field" /></Field>
              <Field label={t.time}><input name="time" type="time" required min="06:30" max="19:30" step={900} defaultValue="12:00" className="field" /></Field>
            </div>
            <Field label={t.notes}><textarea name="notes" rows={3} className="field resize-y" /></Field>
          </fieldset>

          <div className="mt-8 space-y-4 border-t border-line pt-8">
            {error && <p key={error} role="alert" className="animate-in rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
            <button disabled={sending || cart.lines.length === 0} className="btn-primary w-full py-4 text-base">
              {sending ? t.sending : `${t.submit} · ${formatPrice(cart.totalCents, lang)}`}
            </button>
          </div>
        </form>

        <aside className="rounded-3xl border border-line bg-card p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl">{dictionaries[lang].cart.title}</h2>
          {cart.lines.length === 0 ? <p className="mt-6 text-muted">{dictionaries[lang].cart.empty}</p> : (
            <ul className="mt-6 divide-y divide-line">
              {cart.lines.map((l) => {
                const p = cart.products.find((p) => p.id === l.productId);
                return p && (
                  <li key={l.productId} className="animate-in flex items-center gap-3 py-4 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{lang === "it" ? p.name_it : p.name_en}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatPrice(p.price_cents, lang)} / {lang === "it" ? p.unit_it : p.unit_en}</p>
                    </div>
                    <Qty value={l.quantity} onChange={(q) => cart.setQty(l.productId, q)} />
                    <span className="w-16 text-right text-sm tabular-nums">{formatPrice(p.price_cents * l.quantity, lang)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-muted">{dictionaries[lang].cart.total}</span>
            <span className="font-serif text-3xl">{formatPrice(cart.totalCents, lang)}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">{t.pickupOnly} · {t.payOnPickup}</p>
        </aside>
      </div>
      </div>
      </ViewTransition>
    </Shell>
  );
}

const Shell = ({ children }: { children: React.ReactNode }) => <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">{children}</div>;

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2 text-sm"><span className="font-medium">{label}</span>{children}</label>;
}
