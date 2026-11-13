"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { dictionaries, type Lang } from "@/lib/i18n";

// Consenso ai cookie di terze parti (oggi solo Google Maps). "open" riapre il banner dal footer.
type Choice = "accepted" | "rejected" | null;
const KEY = "cookie-consent";
const EVENT = "cookie-consent";
let reopened = false;

const read = (): Choice => { try { return localStorage.getItem(KEY) as Choice; } catch { return null; } };
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
};

export function setConsent(choice: "accepted" | "rejected") {
  try { localStorage.setItem(KEY, choice); } catch {}
  reopened = false;
  window.dispatchEvent(new Event(EVENT));
}

/** null sul server e finché il visitatore non sceglie: nel dubbio niente cookie di terze parti. */
export const useConsent = () => useSyncExternalStore(subscribe, read, () => null);

export function ConsentBanner({ lang }: { lang: Lang }) {
  const t = dictionaries[lang].cookies;
  const choice = useSyncExternalStore(subscribe, () => (reopened ? null : read()) ?? "ask", () => "ssr");
  const pathname = usePathname();
  if (choice !== "ask" || pathname.includes("/dashboard")) return null;
  return (
    <div role="dialog" aria-label={t.title} className="animate-in fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-3xl border border-line bg-card p-5 shadow-2xl sm:p-6">
      <p className="font-serif text-xl">{t.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {t.body} <a href={`/${lang}/privacy`} className="text-accent underline underline-offset-4">{t.more}</a>
      </p>
      {/* Accetta e rifiuta con lo stesso peso, come chiede il Garante */}
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <button onClick={() => setConsent("rejected")} className="btn-ghost">{t.reject}</button>
        <button onClick={() => setConsent("accepted")} className="btn-primary">{t.accept}</button>
      </div>
    </div>
  );
}

export function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button onClick={() => { reopened = true; window.dispatchEvent(new Event(EVENT)); }} className="underline-offset-4 hover:text-fg hover:underline">
      {label}
    </button>
  );
}

/** Mappa di Google Maps: si carica solo con il consenso, altrimenti un riquadro che permette di darlo. */
export function MapEmbed({ src, title, lang }: { src: string; title: string; lang: Lang }) {
  const t = dictionaries[lang].cookies;
  const consent = useConsent();
  if (consent === "accepted")
    return <iframe title={title} src={src} className="min-h-80 w-full rounded-3xl border border-line grayscale-[30%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
  return (
    <div className="grain flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl p-8 text-center text-white">
      <button onClick={() => setConsent("accepted")} className="btn bg-white text-neutral-900 hover:bg-white/90">{t.showMap}</button>
      <p className="max-w-xs text-xs leading-relaxed text-white/75">{t.mapNote}</p>
    </div>
  );
}
