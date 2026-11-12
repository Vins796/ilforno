"use client";

import { useEffect, useState } from "react";
import { dictionaries, type Lang } from "@/lib/i18n";
import { categories, type Category, type Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

export function Catalog({ products, lang }: { products: Product[]; lang: Lang }) {
  const t = dictionaries[lang];
  const [filter, setFilter] = useState<Category | null>(null);

  // La categoria arriva dall'hash (/shop#torte) per restare una pagina statica
  useEffect(() => {
    const read = () => {
      const h = location.hash.slice(1);
      setFilter((categories as readonly string[]).includes(h) ? (h as Category) : null);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const pick = (c: Category | null) => {
    history.replaceState(null, "", c ? `#${c}` : location.pathname);
    setFilter(c);
  };
  const shown = filter ? products.filter((p) => p.category === filter) : products;

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2" role="tablist">
        {[null, ...categories].map((c) => (
          <button key={c ?? "all"} role="tab" aria-selected={filter === c} onClick={() => pick(c)}
            className={`rounded-full border px-4 py-2 text-sm transition ${filter === c ? "border-accent bg-accent text-accent-fg" : "border-line hover:bg-soft"}`}>
            {c ? t.categories[c] : t.shop.all}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => <ProductCard key={p.id} product={p} lang={lang} />)}
      </div>
    </>
  );
}
