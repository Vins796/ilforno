"use client";

import Image from "next/image";
import { useState } from "react";
import { dictionaries, formatPrice, type Lang } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { useCart } from "./cart";

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-soft ${className}`}>
      {product.image_url ? (
        <Image src={product.image_url} alt={product.name_it} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <div className="grain grid h-full w-full place-items-center">
          <span className="font-serif text-5xl text-white/70">{product.name_it[0]}</span>
        </div>
      )}
    </div>
  );
}

export function ProductCard({ product, lang }: { product: Product; lang: Lang }) {
  const t = dictionaries[lang].shop;
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const name = lang === "it" ? product.name_it : product.name_en;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <ProductImage product={product} className="aspect-[4/3]" />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.weekly_special && <Badge>{t.special}</Badge>}
          {product.requires_advance && <Badge>{t.advance}</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-xl">{name}</h3>
        <p className="flex-1 text-sm text-muted">{lang === "it" ? product.description_it : product.description_en}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-medium">
            {formatPrice(product.price_cents, lang)} <span className="text-sm text-muted">/ {lang === "it" ? product.unit_it : product.unit_en}</span>
          </span>
          <button
            disabled={!product.available}
            onClick={() => { add(product.id); setAdded(true); setTimeout(() => setAdded(false), 1200); }}
            className="btn-primary px-4 py-2"
            aria-label={`${t.add}: ${name}`}
          >
            {!product.available ? t.unavailable : added ? `✓ ${t.added}` : `+ ${t.add}`}
          </button>
        </div>
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-fg backdrop-blur">{children}</span>;
}
