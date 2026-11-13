"use client";

import { useEffect, useState, ViewTransition } from "react";

type Toast = { id: number; text: string; error?: boolean };

/** Mostra un avviso in alto a destra, sotto l'header; serve un <Toaster /> montato nella pagina. */
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
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-20 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-6">
      {toasts.map((t) => (
        <ViewTransition key={t.id} enter="pop" exit="pop" default="none">
          <div role={t.error ? "alert" : "status"}
            className={`animate-in pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium shadow-2xl ${t.error ? "bg-red-600 text-white" : "bg-fg text-bg"}`}>
            <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${t.error ? "bg-white/20" : "bg-green-500 text-white"}`}>{t.error ? "!" : "✓"}</span>
            <span className="flex-1">{t.text}</span>
            <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} aria-label="Chiudi avviso" className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
          </div>
        </ViewTransition>
      ))}
    </div>
  );
}
