import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { indirizzo, negozio } from "@/lib/negozio";

export const metadata: Metadata = { title: "Privacy" };

// Bozza ragionevole, non un parere legale: da far rivedere al consulente del negozio.
const UPDATED = { it: "13 novembre 2026", en: "13 November 2026" };

const content = (lang: Lang) => {
  const who = `${negozio.titolare} (${negozio.nome}), ${indirizzo(lang)}, P.IVA ${negozio.piva}`;
  const tel = negozio.telefonoVisibile;
  return lang === "it" ? {
    title: "Informativa sulla privacy",
    intro: "Questa pagina spiega quali dati raccogliamo quando usi il sito, perché e come puoi controllarli.",
    sections: [
      ["Chi tratta i tuoi dati", `Il titolare del trattamento è ${who}. Per qualsiasi richiesta puoi chiamarci al ${tel} o passare in negozio.`],
      ["Quali dati raccogliamo", "Quando ordini: nome, email e/o telefono, giorno e ora di ritiro, note e prodotti scelti. Se crei un account: email, nome e password (conservata cifrata). Se accedi con Google riceviamo solo nome, indirizzo email e immagine del profilo. Nel tuo browser salviamo il carrello e la scelta del tema chiaro/scuro; non usiamo cookie di profilazione né strumenti di tracciamento pubblicitario."],
      ["Perché li usiamo", "Per preparare il tuo ordine, avvisarti quando cambia stato (via email o, se non hai lasciato l'email, via SMS) e mostrarti lo storico degli ordini nel tuo account. La base giuridica è l'esecuzione del servizio che ci chiedi (art. 6.1.b GDPR). Non usiamo i tuoi dati per pubblicità e non li vendiamo."],
      ["Chi altro li tratta", "Ci affidiamo ad alcuni fornitori che trattano i dati per nostro conto: Supabase (database e accessi), Vercel (hosting del sito), Google (solo se scegli l'accesso con Google) e, quando attivi, servizi di invio email e SMS. Alcuni hanno sede fuori dall'UE: il trasferimento avviene con le garanzie previste dal GDPR, come le clausole contrattuali standard."],
      ["Cookie", "Il sito usa solo strumenti tecnici, necessari al funzionamento: nel tuo browser restano il carrello, il tema chiaro/scuro e, se accedi, la sessione dell'account. Non usiamo cookie di profilazione né statistiche. Nella sezione “Dove siamo” mostriamo una mappa di Google Maps: caricandola, Google può impostare i propri cookie, secondo la sua informativa (policies.google.com/privacy)."],
      ["Per quanto tempo", "I dati degli ordini li conserviamo per il tempo necessario a gestirli e poi al massimo 24 mesi, per lo storico del negozio. L'account resta attivo finché non ci chiedi di cancellarlo."],
      ["I tuoi diritti", "Puoi chiederci in qualsiasi momento di vedere, correggere, cancellare o ricevere in copia i tuoi dati, oppure di limitarne o opporti al trattamento. Se pensi che li trattiamo in modo scorretto puoi rivolgerti al Garante per la protezione dei dati personali (garanteprivacy.it)."],
    ],
    updated: `Ultimo aggiornamento: ${UPDATED.it}`,
  } : {
    title: "Privacy policy",
    intro: "This page explains what data we collect when you use the website, why, and how you can control it.",
    sections: [
      ["Who handles your data", `The data controller is ${who}. For any request you can call us on ${tel} or drop by the shop.`],
      ["What we collect", "When you order: name, email and/or phone, pickup day and time, notes and chosen products. If you create an account: email, name and password (stored encrypted). If you sign in with Google we only receive your name, email address and profile picture. Your browser stores the cart and your light/dark theme choice; we use no profiling cookies or advertising trackers."],
      ["Why we use it", "To prepare your order, notify you when its status changes (by email or, if you left no email, by SMS) and show your order history in your account. The legal basis is providing the service you ask for (Art. 6(1)(b) GDPR). We don't use your data for advertising and we never sell it."],
      ["Who else processes it", "We rely on a few providers that process data on our behalf: Supabase (database and sign-in), Vercel (website hosting), Google (only if you choose Google sign-in) and, once enabled, email and SMS delivery services. Some are based outside the EU: transfers use the safeguards required by the GDPR, such as standard contractual clauses."],
      ["Cookies", "The website only uses technical tools needed for it to work: your browser keeps the cart, the light/dark theme and, if you sign in, your account session. We use no profiling or analytics cookies. The “Visit” section shows a Google Maps map: when it loads, Google may set its own cookies under its privacy policy (policies.google.com/privacy)."],
      ["How long we keep it", "Order data is kept as long as needed to handle the order and then for at most 24 months as shop history. Your account stays active until you ask us to delete it."],
      ["Your rights", "You can ask us at any time to access, correct, delete or receive a copy of your data, or to restrict or object to its processing. If you think we handle it unlawfully you can contact the Italian Data Protection Authority (garanteprivacy.it)."],
    ],
    updated: `Last updated: ${UPDATED.en}`,
  };
};

export default async function Privacy({ params }: PageProps<"/[lang]/privacy">) {
  const lang = (await params).lang as Lang;
  const c = content(lang);
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-5xl">{c.title}</h1>
      <p className="mt-4 text-lg text-muted">{c.intro}</p>
      <div className="mt-12 space-y-10">
        {c.sections.map(([h, body]) => (
          <section key={h}>
            <h2 className="font-serif text-2xl">{h}</h2>
            <p className="mt-3 leading-relaxed text-muted">{body}</p>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted">{c.updated}</p>
    </article>
  );
}
