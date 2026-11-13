"use client";

import { useEffect, useState, ViewTransition } from "react";

type Toast = { id: number; text: string; error?: boolean };

/** Mostra un avviso in basso a destra; serve un <Toaster /> montato nella pagina. */
export function toast(text: string, error = false) {
  window.dispatchEvent(new CustomEvent<Omit<Toast, "id">>("toast", { detail: { text, error } }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let next = 0;
    const onToast = (e: Event) => {
      const t = { ...(e as CustomEvent<Omit<Toast, "id">>).detail, id: next++ };
      setToasts((ts) => [...ts, t]);
      // Gli errori restano di più: vanno letti
      setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), t.error ? 6000 : 3500);
    };
    window.addEventListener("toast", onToast);
    return () => window.removeEventListener("toast", onToast);
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
      {toasts.map((t) => (
        <ViewTransition key={t.id} enter="pop" exit="pop" default="none">
          <div role={t.error ? "alert" : "status"}
            className={`animate-in pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg ${t.error ? "border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200" : "border-line bg-card"}`}>
            <span aria-hidden className={t.error ? "" : "text-green-600 dark:text-green-400"}>{t.error ? "⚠" : "✓"}</span>
            <span className="flex-1">{t.text}</span>
            <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} aria-label="Chiudi avviso" className="text-muted hover:text-fg">×</button>
          </div>
        </ViewTransition>
      ))}
    </div>
  );
}
