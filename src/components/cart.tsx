"use client";

import { createContext, startTransition, use, useEffect, useMemo, useState } from "react";
import type { CartLine, Product } from "@/lib/types";

type Cart = {
  products: Product[];
  lines: CartLine[];
  count: number;
  totalCents: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);
const KEY = "ilforno-cart";

export function CartProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  // null finché non abbiamo letto localStorage: evita di sovrascrivere il carrello salvato con uno vuoto
  const [saved, setSaved] = useState<CartLine[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let initial: CartLine[] = [];
    try { initial = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch {}
    // localStorage è modificabile dall'utente: teniamo solo righe valide
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legge localStorage solo dopo l'idratazione
    setSaved(Array.isArray(initial)
      ? initial.filter((l) => typeof l?.productId === "string" && Number.isInteger(l.quantity) && l.quantity > 0)
      : []);
  }, []);

  useEffect(() => {
    if (saved) try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
  }, [saved]);

  // Prodotti rimossi o esauriti restano salvati ma non vengono mostrati né ordinati
  const lines = useMemo(
    () => (saved ?? []).filter((l) => products.some((p) => p.id === l.productId && p.available)),
    [saved, products],
  );

  const value = useMemo<Cart>(() => {
    const priceOf = (id: string) => products.find((p) => p.id === id)?.price_cents ?? 0;
    // In una transition: le righe del carrello entrano ed escono con un'animazione
    const setQty = (productId: string, quantity: number) => startTransition(() =>
      setSaved((prev) => {
        const ls = prev ?? [];
        return quantity <= 0
          ? ls.filter((l) => l.productId !== productId)
          : ls.some((l) => l.productId === productId)
            ? ls.map((l) => (l.productId === productId ? { ...l, quantity } : l))
            : [...ls, { productId, quantity }];
      }));
    return {
      products, lines, open, setOpen, setQty,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      totalCents: lines.reduce((s, l) => s + priceOf(l.productId) * l.quantity, 0),
      add: (id) => setQty(id, (lines.find((l) => l.productId === id)?.quantity ?? 0) + 1),
      clear: () => setSaved([]),
    };
  }, [products, lines, open]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const c = use(CartContext);
  if (!c) throw new Error("useCart fuori da CartProvider");
  return c;
}
