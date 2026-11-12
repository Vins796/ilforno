import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import { isLang, locales } from "@/lib/i18n";
import { getProducts } from "@/lib/data";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "../globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "opsz"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Applica il tema prima del rendering (niente lampo bianco) e segue il sistema se l'utente non ha scelto.
const themeScript = `(function(){var m=matchMedia('(prefers-color-scheme: dark)');function a(){var t=null;try{t=localStorage.getItem('theme')}catch(e){}document.documentElement.classList.toggle('dark',t?t==='dark':m.matches)}a();m.addEventListener('change',a)})()`;

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
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <Script id="theme" strategy="beforeInteractive">{themeScript}</Script>
        <CartProvider products={products}>
          <Header lang={lang} />
          <main className="flex-1">{children}</main>
          <Footer lang={lang} />
        </CartProvider>
      </body>
    </html>
  );
}
