import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { isLang, locales } from "@/lib/i18n";
import { getProducts } from "@/lib/data";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { jsonLd } from "@/lib/negozio";
import "../globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "opsz"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Script bloccante in <head>: applica il tema prima del primo disegno (niente lampo).
// Tema chiaro di default; scuro solo se l'utente l'ha scelto con il pulsante. Gira solo
// nell'HTML del server: il layout radice non viene mai rimontato nel browser.
const themeScript = `(function(){var t=null;try{t=localStorage.getItem('theme')}catch(e){}document.documentElement.classList.toggle('dark',t==='dark')})()`;

export const metadata: Metadata = {
  title: { default: "Il Forno · Panetteria a Poirino", template: "%s · Il Forno" },
  description: "Pane, focacce, dolci e torte della tradizione piemontese. Ordina online e ritira a Poirino (TO).",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const products = await getProducts();

  return (
    <html lang={lang} suppressHydrationWarning data-scroll-behavior="smooth" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <CartProvider products={products}>
          <Header lang={lang} />
          <main className="flex-1">{children}</main>
          <Footer lang={lang} />
        </CartProvider>
      </body>
    </html>
  );
}
