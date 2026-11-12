"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, formatPrice, type Lang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useIsStaff, useSession } from "@/lib/use-session";
import { TZ } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { AuthForm } from "@/components/auth-form";

export function AccountView({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const session = useSession();
  const staff = useIsStaff();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    // Lo staff non ha ordini personali: niente caricamento (staff è undefined finché non lo sappiamo)
    if (!session || staff !== false) return;
    if (new URLSearchParams(location.search).get("next") === "checkout") return router.replace(`/${lang}/checkout`);
    supabase().from("orders").select("*, order_items(*)").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setOrders((data as Order[]) ?? []));
  }, [session, staff, lang, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="mb-10 font-serif text-5xl">{t.account.title}</h1>
      {session === undefined ? null : session === null ? <AuthForm lang={lang} /> : (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="text-muted">{session.user.email}</p>
            <button onClick={() => supabase().auth.signOut()} className="btn-ghost">{t.account.logout}</button>
          </div>
          {staff && (
            <Link href={`/${lang}/dashboard`} className="animate-in mt-8 flex items-center justify-between gap-4 rounded-3xl border border-accent/40 bg-accent/10 p-6 transition hover:bg-accent/15">
              <div>
                <p className="font-serif text-2xl">{t.account.dashboard}</p>
                <p className="mt-1 text-sm text-muted">{t.account.dashboardHint}</p>
              </div>
              <span className="text-2xl text-accent" aria-hidden>→</span>
            </Link>
          )}
          {staff === false && (<>
          <h2 className="mt-12 font-serif text-3xl">{t.account.orders}</h2>
          {orders?.length === 0 && <p className="mt-4 text-muted">{t.account.noOrders}</p>}
          <ul className="mt-6 space-y-4">
            {orders?.map((o) => (
              <li key={o.id} className="animate-in rounded-2xl border border-line bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">#{o.number} · {new Intl.DateTimeFormat(lang, { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }).format(new Date(o.pickup_at))}</span>
                  <span className="rounded-full bg-soft px-3 py-1 text-xs">{t.status[o.status]}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{o.order_items?.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                <p className="mt-2 text-sm font-medium">{formatPrice(o.total_cents, lang)}</p>
              </li>
            ))}
          </ul>
          </>)}
        </>
      )}
    </div>
  );
}
