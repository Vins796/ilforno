"use client";

import { startTransition, useCallback, useEffect, useState, ViewTransition } from "react";
import { dictionaries, formatPrice } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { categories, type Product } from "@/lib/types";
import { ProductImage } from "@/components/product-card";
import { Icon } from "@/components/header";
import { Field } from "../checkout/form";
import { refreshCatalog } from "../../actions";

const cat = dictionaries.it.categories;
// shortcut: filtri e pagine calcolati nel browser sull'elenco completo, va bene fino a qualche centinaio di prodotti
const PER_PAGE = 10;
const empty: Omit<Product, "id"> = {
  name_it: "", name_en: "", description_it: "", description_en: "", category: "pane", price_cents: 0,
  unit_it: "pz", unit_en: "pc", image_url: null, available: true, weekly_special: false, requires_advance: false, sort: 0,
};

export function Products({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditingNow] = useState<Partial<Product> | null>(null);
  const [filter, setFilter] = useState<Product["category"] | "tutte">("tutte");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  // Apertura e chiusura della finestra di modifica con dissolvenza
  const setEditing = (p: Partial<Product> | null) => startTransition(() => setEditingNow(p));

  const load = useCallback(async () => {
    const { data } = await supabase().from("products").select("*").order("sort");
    startTransition(() => setProducts((data as Product[]) ?? []));
  }, []);
   
  useEffect(() => { load(); }, [load]);

  async function save(p: Partial<Product>) {
    const { id, ...fields } = p;
    const { error } = id ? await supabase().from("products").update(fields).eq("id", id) : await supabase().from("products").insert(fields);
    if (error) return alert(`Errore: ${error.message}`);
    await Promise.all([load(), refreshCatalog(token)]);
  }

  async function remove(p: Product) {
    if (!confirm(`Eliminare "${p.name_it}"? Gli ordini passati restano.`)) return;
    const { error } = await supabase().from("products").delete().eq("id", p.id);
    if (error) return alert(`Errore: ${error.message}`);
    setEditing(null);
    await Promise.all([load(), refreshCatalog(token)]);
  }

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) =>
    (filter === "tutte" || p.category === filter) && (!q || `${p.name_it} ${p.name_en}`.toLowerCase().includes(q)));
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button onClick={() => setEditing({ ...empty, sort: products.length + 1 })} className="btn-primary">+ Nuovo prodotto</button>
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Cerca per nome…" aria-label="Cerca prodotto per nome" className="field sm:max-w-xs" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtra per categoria">
          {(["tutte", ...categories] as const).map((c) => (
            <Toggle key={c} on={filter === c} label={c === "tutte" ? "Tutte" : cat[c]} onClick={() => { setFilter(c); setPage(1); }} />
          ))}
        </div>
      </div>
      {visible.length === 0 && <p className="rounded-3xl border border-line bg-card p-8 text-center text-muted">Nessun prodotto trovato.</p>}
      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-card empty:hidden">
        {visible.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
            <ProductImage product={p} className="h-14 w-14 shrink-0 rounded-xl" />
            <button onClick={() => setEditing(p)} className="min-w-40 flex-1 text-left">
              <p className="font-medium">{p.name_it}</p>
              <p className="text-sm text-muted">{cat[p.category]} · {formatPrice(p.price_cents, "it")} / {p.unit_it}</p>
            </button>
            <div className="flex flex-wrap gap-2">
              <Toggle on={p.available} label={p.available ? "Disponibile" : "Esaurito"} onClick={() => save({ id: p.id, available: !p.available })} />
              <Toggle on={p.weekly_special} label="Della settimana" onClick={() => save({ id: p.id, weekly_special: !p.weekly_special })} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} aria-label={`Modifica ${p.name_it}`} title="Modifica" className="rounded-full p-2 text-muted hover:bg-soft hover:text-fg">
                <Icon className="h-4 w-4" d="M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4" />
              </button>
              <button onClick={() => remove(p)} aria-label={`Elimina ${p.name_it}`} title="Elimina" className="rounded-full p-2 text-red-600 hover:bg-red-500/10 dark:text-red-400">
                <Icon className="h-4 w-4" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav className="mt-5 flex items-center justify-center gap-3 text-sm" aria-label="Pagine">
          <button disabled={current === 1} onClick={() => setPage(current - 1)} className="btn-ghost px-4 py-2">← Prec.</button>
          <span className="tabular-nums text-muted">Pagina {current} di {pages} · {filtered.length} prodotti</span>
          <button disabled={current === pages} onClick={() => setPage(current + 1)} className="btn-ghost px-4 py-2">Succ. →</button>
        </nav>
      )}
      {editing && <ViewTransition enter="pop" exit="pop" default="none"><Editor product={editing} onClose={() => setEditing(null)} onSave={async (p) => { await save(p); setEditing(null); }} onDelete={remove} /></ViewTransition>}
    </>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={`rounded-full border px-3 py-1.5 text-xs transition ${on ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:bg-soft"}`}>
      {label}
    </button>
  );
}

function Editor({ product, onClose, onSave, onDelete }: {
  product: Partial<Product>; onClose: () => void; onSave: (p: Partial<Product>) => Promise<void>; onDelete: (p: Product) => void;
}) {
  const [p, setP] = useState(product);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));

  async function upload(file: File) {
    setBusy(true);
    const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase().storage.from("products").upload(path, file, { contentType: file.type });
    setBusy(false);
    if (error) return alert(`Errore caricamento: ${error.message}`);
    set("image_url", supabase().storage.from("products").getPublicUrl(path).data.publicUrl);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSave(p); setBusy(false); }}
        className="max-h-[90dvh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl bg-card p-6"
      >
        <h2 className="font-serif text-3xl">{p.id ? "Modifica prodotto" : "Nuovo prodotto"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome (italiano)"><input required value={p.name_it} onChange={(e) => set("name_it", e.target.value)} className="field" /></Field>
          <Field label="Nome (inglese)"><input required value={p.name_en} onChange={(e) => set("name_en", e.target.value)} className="field" /></Field>
          <Field label="Descrizione (italiano)"><textarea rows={2} value={p.description_it} onChange={(e) => set("description_it", e.target.value)} className="field" /></Field>
          <Field label="Descrizione (inglese)"><textarea rows={2} value={p.description_en} onChange={(e) => set("description_en", e.target.value)} className="field" /></Field>
          <Field label="Categoria">
            <select value={p.category} onChange={(e) => set("category", e.target.value as Product["category"])} className="field">
              {categories.map((c) => <option key={c} value={c}>{cat[c]}</option>)}
            </select>
          </Field>
          <Field label="Prezzo (€)">
            <input required type="number" min={0} step="0.01" defaultValue={(p.price_cents ?? 0) / 100} onChange={(e) => set("price_cents", Math.round(Number(e.target.value) * 100))} className="field" />
          </Field>
          <Field label="Unità (it), es. kg, pz, etto"><input required value={p.unit_it} onChange={(e) => set("unit_it", e.target.value)} className="field" /></Field>
          <Field label="Unità (en)"><input required value={p.unit_en} onChange={(e) => set("unit_en", e.target.value)} className="field" /></Field>
          <Field label="Ordine di visualizzazione"><input type="number" value={p.sort} onChange={(e) => set("sort", Number(e.target.value))} className="field" /></Field>
          <Field label="Foto"><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="field" /></Field>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {([["available", "Disponibile"], ["weekly_special", "Chicca della settimana"], ["requires_advance", "Su ordinazione (almeno 1 giorno prima)"]] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={!!p[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />{label}</label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button disabled={busy} className="btn-primary">{busy ? "…" : "Salva"}</button>
          {/* Dopo una modifica il tasto dice chiaramente che le modifiche vengono scartate */}
          <button type="button" onClick={onClose} className="btn-ghost">{p === product ? "Chiudi" : "Annulla"}</button>
          {p.id && <button type="button" onClick={() => onDelete(p as Product)} className="ml-auto text-sm text-red-600 hover:underline">Elimina</button>}
        </div>
      </form>
    </div>
  );
}
