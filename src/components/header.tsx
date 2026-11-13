"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition, useEffect, useState, useSyncExternalStore, ViewTransition } from "react";
import { dictionaries, formatPrice, type Lang } from "@/lib/i18n";
import { useCart } from "./cart";
import { useIsStaff } from "@/lib/use-session";

/** Logo tondo (contiene già il nome). Il file (public/logo.jpg) è piccolo, 150×150: va bene fino a ~70px. */
export function Logo({ size = 56 }: { size?: number }) {
  return <Image src="/logo.jpg" alt="Il Forno" width={size} height={size} priority className="shrink-0 rounded-full bg-white ring-1 ring-line" />;
}

export function Header({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const pathname = usePathname();
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  const staff = useIsStaff();
  const other: Lang = lang === "it" ? "en" : "it";
  const switchHref = pathname.replace(/^\/(it|en)/, `/${other}`);
  const links = [
    ["shop", `/${lang}/shop`, t.nav.shop],
    ["about", `/${lang}#about`, t.nav.about],
    ["visit", `/${lang}#visit`, t.nav.visit],
  ] as const;

  // Voce attiva: la pagina (Prodotti, Account, Checkout) oppure, in home, la sezione al centro dello schermo
  const section = useActiveSection(pathname === `/${lang}`);
  const current =
    pathname.startsWith(`/${lang}/shop`) ? "shop"
    : pathname.startsWith(`/${lang}/account`) ? "account"
    : pathname.startsWith(`/${lang}/checkout`) ? "checkout"
    : section;
  const mobileLinks = [
    ...links,
    ["account", `/${lang}/account`, t.nav.account] as const,
    ...(staff ? [["dashboard", `/${lang}/dashboard`, t.account.dashboard] as const] : []),
  ];

  if (pathname.includes("/dashboard")) return null;

  return (
    <>
      <header className="intro-header sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href={`/${lang}`} aria-label="Il Forno — home"><Logo /></Link>
          <nav className="ml-6 hidden gap-6 self-stretch text-sm md:flex">
            {links.map(([key, href, label]) => (
              <Link key={key} href={href} aria-current={current === key ? (key === "shop" ? "page" : "location") : undefined}
                className={`relative flex items-center transition hover:text-fg ${current === key ? "text-fg" : "text-muted"}`}>
                {label}
                {/* Linetta sotto la voce attiva, appoggiata sul bordo dell'header */}
                <span aria-hidden className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent transition-transform duration-300 ${current === key ? "scale-x-100" : "scale-x-0"}`} />
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            {/* <a> e non <Link>: cambiare lingua cambia il layout radice; un caricamento completo riapplica il tema prima del rendering */}
            <a href={switchHref} className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-soft" aria-label={other === "en" ? "Switch to English" : "Passa all'italiano"}>
              {other}
            </a>
            <ThemeToggle lang={lang} />
            {staff && (
              // Solo per chi è staff (Marco e Anna): scorciatoia alla dashboard
              <Link href={`/${lang}/dashboard`} className="animate-in rounded-full p-2 text-accent hover:bg-soft" aria-label={t.account.dashboard} title={t.account.dashboard}>
                <Icon d="M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z" />
              </Link>
            )}
            <Link href={`/${lang}/account`} aria-current={current === "account" ? "page" : undefined} className={`hidden rounded-full p-2 hover:bg-soft sm:block ${current === "account" ? "bg-soft text-accent" : ""}`} aria-label={t.nav.account}>
              <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
            </Link>
            <button onClick={() => cart.setOpen(true)} className={`relative rounded-full p-2 hover:bg-soft ${current === "checkout" ? "bg-soft text-accent" : ""}`} aria-label={`${t.nav.cart} (${cart.count})`}>
              <Icon d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Zm4 0V6a3 3 0 0 1 6 0v2" />
              {cart.count > 0 && (
                <span key={cart.count} className="animate-in absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">{cart.count}</span>
              )}
            </button>
            <button onClick={() => startTransition(() => setMenu(!menu))} className="rounded-full p-2 hover:bg-soft md:hidden" aria-label="Menu" aria-expanded={menu}>
              <Icon d={menu ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
            </button>
          </div>
        </div>
        {menu && (
          <ViewTransition enter="pop" exit="pop" default="none">
            <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
              {mobileLinks.map(([key, href, label]) => (
                <Link key={key} href={href} onClick={() => startTransition(() => setMenu(false))} aria-current={current === key ? "page" : undefined}
                  className={`rounded-lg px-3 py-3 hover:bg-soft ${current === key ? "bg-soft font-medium text-accent" : ""}`}>{label}</Link>
              ))}
            </nav>
          </ViewTransition>
        )}
      </header>
      <CartDrawer lang={lang} />
    </>
  );
}

const SECTIONS = ["about", "visit"] as const;

/** In home: quale sezione del menu attraversa la linea a metà schermo (null in hero, chicche, recensioni…). */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<(typeof SECTIONS)[number] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        setActive(SECTIONS.find((id) => visible.get(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" }, // fascia sottile al centro della finestra
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [enabled]);
  return enabled ? active : null;
}

const root = () => document.documentElement;
const subscribeTheme = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(root(), { attributes: true, attributeFilter: ["class"] });
  return () => o.disconnect();
};

export function ThemeToggle({ lang }: { lang: Lang }) {
  // Serve solo per l'aria-label: l'icona visibile la sceglie il CSS (classe "dark" già impostata
  // dallo script nel <head>), così non cambia durante l'idratazione.
  const dark = useSyncExternalStore(subscribeTheme, () => root().classList.contains("dark"), () => false);
  const t = dictionaries[lang].theme;
  const toggle = () => {
    const apply = () => {
      const next = !root().classList.contains("dark");
      root().classList.toggle("dark", next);
      try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    };
    // Dissolvenza tra i due temi dove il browser lo supporta, altrimenti cambio diretto
    // Il catch evita l'errore in console quando si clicca di nuovo durante l'animazione (transizione saltata)
    if (document.startViewTransition) document.startViewTransition(apply).ready.catch(() => {});
    else apply();
  };
  return (
    <button onClick={toggle} className="rounded-full p-2 hover:bg-soft" aria-label={dark ? t.light : t.dark}>
      <Icon className="hidden h-5 w-5 dark:block" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m11.4 0 1.4 1.4M4.9 4.9l1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <Icon className="block h-5 w-5 dark:hidden" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </button>
  );
}

function CartDrawer({ lang }: { lang: Lang }) {
  const t = dictionaries[lang].cart;
  const { open, setOpen, lines, products, setQty, totalCents } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside role="dialog" aria-label={t.title} className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-500 ease-[var(--ease-out)] ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-serif text-2xl">{t.title}</h2>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-soft" aria-label={t.close}><Icon d="M6 6l12 12M18 6 6 18" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? <p className="text-muted">{t.empty}</p> : (
            <ul className="space-y-4">
              {lines.map((l) => {
                const p = products.find((p) => p.id === l.productId);
                if (!p) return null;
                return (
                  <ViewTransition key={l.productId} enter="pop" exit="pop" default="none">
                  <li className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{lang === "it" ? p.name_it : p.name_en}</p>
                      <p className="text-sm text-muted">{formatPrice(p.price_cents, lang)} / {lang === "it" ? p.unit_it : p.unit_en}</p>
                    </div>
                    <Qty value={l.quantity} onChange={(q) => setQty(l.productId, q)} />
                  </li>
                  </ViewTransition>
                );
              })}
            </ul>
          )}
        </div>
        {lines.length > 0 && (
          <div className="space-y-4 border-t border-line p-5">
            <div className="flex justify-between text-lg"><span>{t.total}</span><span className="font-semibold">{formatPrice(totalCents, lang)}</span></div>
            <Link href={`/${lang}/checkout`} onClick={() => setOpen(false)} className="btn-primary w-full">{t.checkout}</Link>
          </div>
        )}
      </aside>
    </div>
  );
}

export function Qty({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center rounded-full border border-line">
      <button onClick={() => onChange(value - 1)} className="h-9 w-9 rounded-full hover:bg-soft" aria-label="−">−</button>
      <span key={value} className="animate-in w-7 text-center text-sm tabular-nums">{value}</span>
      <button onClick={() => onChange(value + 1)} className="h-9 w-9 rounded-full hover:bg-soft" aria-label="+">+</button>
    </div>
  );
}

export function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}
