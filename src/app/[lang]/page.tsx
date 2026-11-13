import Link from "next/link";
import { dictionaries, type Lang } from "@/lib/i18n";
import { getProducts } from "@/lib/data";
import { categories } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { indicazioni, indirizzo, mappaEmbed, negozio } from "@/lib/negozio";

// shortcut: recensioni di esempio, da sostituire con quelle vere (o widget Google) quando disponibili
const reviews = [
  { name: "Giulia", text: { it: "Entri per il pane e esci col sorriso. Anna si ricorda sempre cosa prendi!", en: "You come in for bread and leave smiling. Anna always remembers your order!" } },
  { name: "Paolo", text: { it: "La focaccia con le cipolle è una droga. Veniamo apposta da Torino.", en: "The onion focaccia is addictive. We drive in from Turin just for it." } },
  { name: "Elena", text: { it: "Torta di nocciole per il compleanno di mia figlia: perfetta e buonissima.", en: "Hazelnut cake for my daughter's birthday: perfect and delicious." } },
];


export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = (await params).lang as Lang;
  const t = dictionaries[lang];
  const specials = (await getProducts()).filter((p) => p.weekly_special && p.available);

  return (
    <>
      {/* HERO — video a tutto schermo. Mettere il file in public/video/hero.mp4 (+ hero.webm opzionale) */}
      <section className="relative -mt-16 flex min-h-[100svh] items-end overflow-hidden">
        <div className="grain absolute inset-0" />
        <video className="intro-video absolute inset-0 h-full w-full object-cover motion-reduce:hidden" autoPlay muted loop playsInline preload="metadata" poster="/video/hero-poster.jpg" aria-hidden>
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-32 text-white sm:px-6 sm:pb-28">
          <p className="intro-text mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 [--delay:400ms]">{t.hero.kicker}</p>
          <h1 className="intro-text max-w-3xl font-serif [--delay:600ms] text-5xl leading-[1.05] font-medium sm:text-7xl">{t.hero.title}</h1>
          <div className="intro-text mt-10 flex flex-wrap gap-3 [--delay:850ms]">
            <Link href={`/${lang}/shop`} className="btn bg-white text-neutral-900 hover:bg-white/90">{t.hero.cta}</Link>
            <Link href="#about" className="btn border border-white/40 text-white hover:bg-white/10">{t.hero.secondary}</Link>
          </div>
        </div>
      </section>

      {/* CHI SIAMO */}
      <section id="about" className="reveal mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-2 md:py-32">
        <div className="grain aspect-[4/5] rounded-[2rem]" role="img" aria-label="Marco e Anna" />
        <div>
          <p className="kicker">{t.about.kicker}</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{t.about.title}</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
            {t.about.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {t.about.values.map((v) => <li key={v} className="rounded-full border border-line px-4 py-2 text-sm">{v}</li>)}
          </ul>
        </div>
      </section>

      {/* PANE DELLA SETTIMANA — calendario fisso dei pani speciali (dal profilo Instagram) */}
      <section className="reveal mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <p className="kicker">{t.daily.kicker}</p>
        <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{t.daily.title}</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {t.daily.days.map(([day, bread]) => (
            <li key={day} className="rounded-3xl border border-line bg-card p-5">
              <p className="text-sm text-muted">{day}</p>
              <p className="mt-2 font-serif text-xl leading-snug">{bread}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-muted">{t.daily.note}</p>
      </section>

      {/* CHICCHE DELLA SETTIMANA */}
      <section className="reveal bg-soft py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="kicker">{t.specials.kicker}</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{t.specials.title}</h2>
          {specials.length === 0 ? (
            <p className="mt-8 text-muted">{t.specials.empty}</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {specials.map((p) => <ProductCard key={p.id} product={p} lang={lang} />)}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIE */}
      <section className="reveal mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <h2 className="font-serif text-4xl sm:text-5xl">{t.categories.title}</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((c) => (
            <Link key={c} href={`/${lang}/shop#${c}`} className="group grain relative flex aspect-square items-end overflow-hidden rounded-3xl p-5 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <span className="relative font-serif text-2xl transition group-hover:translate-x-1">{t.categories[c]} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* RECENSIONI */}
      <section className="reveal border-y border-line py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="kicker">{t.reviews.kicker}</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{t.reviews.title}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="rounded-3xl border border-line bg-card p-7">
                <div className="text-accent" aria-label="5/5">★★★★★</div>
                <blockquote className="mt-4 font-serif text-xl leading-snug">“{r.text[lang]}”</blockquote>
                <figcaption className="mt-5 text-sm text-muted">— {r.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* DOVE SIAMO */}
      <section id="visit" className="reveal mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 md:grid-cols-2">
        <div>
          <p className="kicker">{t.visit.kicker}</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{t.visit.title}</h2>
          <p className="mt-6 text-lg">{indirizzo(lang)}</p>
          <h3 className="mt-8 font-semibold">{t.visit.hours}</h3>
          <dl className="mt-3 space-y-2 text-muted">
            {t.visit.days.map(([d, h]) => (
              <div key={d} className="flex justify-between gap-4 border-b border-line pb-2"><dt>{d}</dt><dd>{h}</dd></div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${negozio.telefono}`} className="btn-primary">{t.visit.phone} {negozio.telefonoVisibile}</a>
            <a href={indicazioni} target="_blank" rel="noopener noreferrer" className="btn-ghost">{t.visit.directions}</a>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <a href={negozio.instagram} target="_blank" rel="noopener noreferrer" className="text-muted underline-offset-4 hover:text-fg hover:underline">{t.visit.instagram}</a>
            <a href={negozio.facebook} target="_blank" rel="noopener noreferrer" className="text-muted underline-offset-4 hover:text-fg hover:underline">{t.visit.facebook}</a>
          </div>
        </div>
        <iframe
          title={`${negozio.nome} — ${indirizzo(lang)}`}
          src={mappaEmbed}
          className="min-h-80 w-full rounded-3xl border border-line grayscale-[30%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}
