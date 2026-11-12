"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { dictionaries, formatPrice, type Lang } from "@/lib/i18n";
import { useCart } from "./cart";

export function Logo({ className = "" }: { className?: string }) {
  // shortcut: logo testuale provvisorio, sostituire con il file del logo quando arriva
  return <span className={`font-serif text-2xl font-semibold tracking-tight ${className}`}>Il Forno</span>;
}

export function Header({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const pathname = usePathname();
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  const other: Lang = lang === "it" ? "en" : "it";
  const switchHref = pathname.replace(/^\/(it|en)/, `/${other}`);
  const links = [
    [`/${lang}/shop`, t.nav.shop],
    [`/${lang}#about`, t.nav.about],
    [`/${lang}#visit`, t.nav.visit],
  ] as const;

  if (pathname.includes("/dashboard")) return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href={`/${lang}`} aria-label="Il Forno — home"><Logo /></Link>
          <nav className="ml-6 hidden gap-6 text-sm md:flex">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="text-muted transition hover:text-fg">{label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Link href={switchHref} className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-soft" aria-label={other === "en" ? "Switch to English" : "Passa all'italiano"}>
              {other}
            </Link>
            <ThemeToggle lang={lang} />
            <Link href={`/${lang}/account`} className="hidden rounded-full p-2 hover:bg-soft sm:block" aria-label={t.nav.account}>
              <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
            </Link>
            <button onClick={() => cart.setOpen(true)} className="relative rounded-full p-2 hover:bg-soft" aria-label={`${t.nav.cart} (${cart.count})`}>
              <Icon d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Zm4 0V6a3 3 0 0 1 6 0v2" />
              {cart.count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">{cart.count}</span>
              )}
            </button>
            <button onClick={() => setMenu(!menu)} className="rounded-full p-2 hover:bg-soft md:hidden" aria-label="Menu" aria-expanded={menu}>
              <Icon d={menu ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
            </button>
          </div>
        </div>
        {menu && (
          <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
            {[...links, [`/${lang}/account`, t.nav.account] as const].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenu(false)} className="rounded-lg px-3 py-3 hover:bg-soft">{label}</Link>
            ))}
          </nav>
        )}
      </header>
      <CartDrawer lang={lang} />
    </>
  );
}

const root = () => document.documentElement;
const subscribeTheme = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(root(), { attributes: true, attributeFilter: ["class"] });
  return () => o.disconnect();
};

function ThemeToggle({ lang }: { lang: Lang }) {
  const dark = useSyncExternalStore(subscribeTheme, () => root().classList.contains("dark"), () => false);
  const t = dictionaries[lang].theme;
  const toggle = () => {
    root().classList.toggle("dark", !dark);
    try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch {}
  };
  return (
    <button onClick={toggle} className="rounded-full p-2 hover:bg-soft" aria-label={dark ? t.light : t.dark}>
      <Icon d={dark ? "M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m11.4 0 1.4 1.4M4.9 4.9l1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" : "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"} />
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
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <aside role="dialog" aria-label={t.title} className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
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
                  <li key={l.productId} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{lang === "it" ? p.name_it : p.name_en}</p>
                      <p className="text-sm text-muted">{formatPrice(p.price_cents, lang)} / {lang === "it" ? p.unit_it : p.unit_en}</p>
                    </div>
                    <Qty value={l.quantity} onChange={(q) => setQty(l.productId, q)} />
                  </li>
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
      <span className="w-7 text-center text-sm tabular-nums">{value}</span>
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
