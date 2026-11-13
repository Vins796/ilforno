"use client";

import { useState } from "react";

/** Finestra di conferma con lo stile del sito, al posto di confirm() del browser. */
export function ConfirmDialog({ title, body, confirmLabel, cancelLabel = "Annulla", onCancel, onConfirm }: {
  title: string; body: string; confirmLabel: string; cancelLabel?: string; onCancel: () => void; onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="conferma-titolo" aria-describedby="conferma-testo" onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onCancel()} className="w-full max-w-md rounded-3xl bg-card p-6">
        <h2 id="conferma-titolo" className="font-serif text-2xl">{title}</h2>
        <p id="conferma-testo" className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          {/* Il fuoco parte da qui: un Invio per sbaglio non conferma */}
          <button autoFocus onClick={onCancel} className="btn-ghost">{cancelLabel}</button>
          <button disabled={busy} onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
            className="btn bg-red-600 text-white hover:bg-red-700">{busy ? "…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
