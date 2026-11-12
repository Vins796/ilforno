import type { Metadata } from "next";
import { dictionaries, type Lang } from "@/lib/i18n";
import { getProducts } from "@/lib/data";
import { Catalog } from "./catalog";

export const metadata: Metadata = { title: "Prodotti / Products" };

export default async function Shop({ params }: PageProps<"/[lang]/shop">) {
  const lang = (await params).lang as Lang;
  const t = dictionaries[lang].shop;
  const products = await getProducts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-5xl">{t.title}</h1>
      <p className="mt-3 text-lg text-muted">{t.subtitle}</p>
      {products.length === 0 ? <p className="mt-10 text-muted">{t.empty}</p> : <Catalog products={products} lang={lang} />}
    </div>
  );
}
