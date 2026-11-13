export const locales = ["it", "en"] as const;
export type Lang = (typeof locales)[number];
export const isLang = (v: string): v is Lang => (locales as readonly string[]).includes(v);

const it = {
  nav: { home: "Home", shop: "Prodotti", about: "Chi siamo", visit: "Dove siamo", account: "Account", cart: "Carrello" },
  hero: { kicker: "Artigiani del grano", title: "Il pane di una volta, con la gentilezza di sempre.", cta: "Ordina e ritira", secondary: "La nostra storia" },
  about: {
    kicker: "Chi siamo",
    title: "Marco & Anna",
    body: [
      "Il Forno è la panetteria storica di via Cavour, quella “dell'angolo”. Marco ha imparato il mestiere proprio qui, impastando per anni accanto a chi c'era prima di noi. Tre anni fa abbiamo deciso di rilevarla e portare avanti la sua tradizione.",
      "Marco impasta e sforna di notte, quando il paese dorme, e all'alba quando si sveglia. Anna è la mente (e le mani) dietro ai dolci: inventa, organizza e, quando serve, ti accoglie al banco con il sorriso. Con noi ci sono Michela e Irene al banco e Federico in laboratorio.",
      "Scegliamo grani di qualità, come il grano antico di Cerere Madre Terra, coltivato qui a Poirino, e seguiamo le ricette della tradizione piemontese. Ma la cosa a cui teniamo di più è semplice: che chi entra si senta accolto, come a casa.",
    ],
    values: ["Grani antichi a km 0", "Ricette della tradizione", "Accoglienza prima di tutto"],
  },
  daily: {
    kicker: "Ogni giorno una bontà diversa", title: "Il pane della settimana",
    days: [["Lunedì", "Pane di grano antico"], ["Martedì", "Pane ai 7 cereali"], ["Mercoledì", "Pane e focaccia zucca e curcuma"], ["Giovedì", "Pane di segale"], ["Venerdì e sabato", "La specialità del mese"]],
    note: "Oltre ai pani di sempre: biova piemontese, maggiolino, toscanino, pasta dura, panino all'olio e i nostri grissini rubatà.",
  },
  specials: { kicker: "Questa settimana", title: "Le chicche della settimana", empty: "Le novità della settimana arrivano a breve." },
  categories: { title: "Cosa sforniamo", pane: "Pane", focacce: "Focacce", dolci: "Dolci", torte: "Torte", stagionali: "Stagionali" },
  reviews: { kicker: "Dicono di noi", title: "Il sorriso fa parte della ricetta" },
  visit: {
    kicker: "Dove siamo", title: "Vieni a trovarci",
    // Fonte: post Instagram con gli orari (Lun–Sab 7:15–12:45 · 16:00–19:30) e profilo (chiuso mercoledì pomeriggio e domenica)
    hours: "Orari", days: [["Lun · Mar · Gio · Ven · Sab", "7:15 – 12:45 · 16:00 – 19:30"], ["Mercoledì", "7:15 – 12:45"], ["Domenica", "Chiuso"]],
    phone: "Chiama", instagram: "Instagram", facebook: "Facebook", directions: "Indicazioni stradali",
  },
  shop: {
    title: "I nostri prodotti", subtitle: "Ordina online e ritira in negozio.", all: "Tutti", add: "Aggiungi", added: "Aggiunto",
    unavailable: "Esaurito", advance: "Su ordinazione", special: "Della settimana", empty: "Il catalogo è in aggiornamento.",
  },
  cart: { title: "Il tuo ordine", empty: "Il carrello è vuoto.", total: "Totale", checkout: "Procedi all'ordine", remove: "Rimuovi", close: "Chiudi" },
  checkout: {
    title: "Conferma l'ordine", sectionYou: "I tuoi dati", sectionPickup: "Quando passi a ritirare?", pickupOnly: "Ritiro in negozio", payOnPickup: "Il pagamento avviene al ritiro.",
    disclaimer: "Le piccole quantità si possono ordinare anche per lo stesso giorno. Torte, prodotti su ordinazione e grandi quantità vanno richiesti almeno un giorno prima.",
    name: "Nome e cognome", email: "Email", phone: "Telefono", contactHint: "Inserisci almeno email o telefono: ti avviseremo lì quando l'ordine è preso in carico e quando è pronto.",
    date: "Giorno di ritiro", time: "Orario di ritiro", notes: "Note (allergie, scritte sulla torta…)", submit: "Invia ordine", sending: "Invio…",
    guest: "Stai ordinando come ospite.", login: "Accedi", or: "oppure",
    success: "Ordine ricevuto!", successBody: "Ti avviseremo appena Marco e Anna lo prendono in carico. Numero ordine:",
    errors: { contact: "Inserisci email o telefono.", advance: "Questo ordine va richiesto almeno un giorno prima: scegli una data da domani in poi.", past: "Scegli un orario futuro.", empty: "Il carrello è vuoto.", generic: "Qualcosa è andato storto, riprova o chiamaci." },
  },
  account: {
    title: "Il tuo account", login: "Accedi", register: "Registrati", logout: "Esci", password: "Password", name: "Nome",
    noAccount: "Non hai un account?", haveAccount: "Hai già un account?", orders: "I tuoi ordini", noOrders: "Nessun ordine ancora.",
    checkEmail: "Controlla la tua email per confermare la registrazione.",
    google: "Continua con Google", or: "oppure con email",
    dashboard: "Apri la dashboard", dashboardHint: "Gestisci ordini, prodotti e andamento del negozio.",
  },
  status: { received: "Ricevuto", preparing: "In preparazione", ready: "Pronto", picked_up: "Ritirato", cancelled: "Annullato" },
  cookies: {
    title: "Cookie", accept: "Accetta", reject: "Rifiuta", more: "Leggi l'informativa", settings: "Preferenze cookie",
    body: "Usiamo solo cookie tecnici, necessari al sito. La mappa di Google Maps però può impostare cookie di Google: la carichiamo solo se accetti.",
    showMap: "Mostra la mappa", mapNote: "La mappa è di Google Maps, che può impostare dei cookie. Premendo il tasto accetti i cookie di Google Maps.",
  },
  footer: { privacy: "Privacy", rights: "Tutti i diritti riservati.", made: "Fatto con lievito madre e pazienza." },
  theme: { light: "Tema chiaro", dark: "Tema scuro" },
};

type Dict = typeof it;

const en: Dict = {
  nav: { home: "Home", shop: "Products", about: "About us", visit: "Visit", account: "Account", cart: "Cart" },
  hero: { kicker: "Wheat Artisans", title: "Bread like it used to be, with the same kindness as always.", cta: "Order & pick up", secondary: "Our story" },
  about: {
    kicker: "About us",
    title: "Marco & Anna",
    body: [
      "Il Forno is the historic bakery on Via Cavour, the one “on the corner”. Marco learned the trade right here, kneading for years alongside those who came before us. Three years ago we decided to take it over and carry its tradition forward.",
      "Marco kneads and bakes at night, while the town sleeps, and at dawn as it wakes up. Anna is the mind (and the hands) behind the cakes and pastries: she invents, organises and, when needed, welcomes you at the counter with a smile. With us are Michela and Irene at the counter and Federico in the bakehouse.",
      "We choose quality grains, like the ancient wheat from Cerere Madre Terra, grown right here in Poirino, and we follow traditional Piedmontese recipes. But what matters most to us is simple: that everyone who walks in feels welcome, as if at home.",
    ],
    values: ["Local ancient grains", "Traditional recipes", "Hospitality first"],
  },
  daily: {
    kicker: "A different treat every day", title: "This week's bread",
    days: [["Monday", "Ancient wheat bread"], ["Tuesday", "7-grain bread"], ["Wednesday", "Pumpkin & turmeric bread and focaccia"], ["Thursday", "Rye bread"], ["Friday & Saturday", "Speciality of the month"]],
    note: "Plus our everyday loaves: Piedmontese biova, maggiolino, toscanino, pasta dura, olive oil rolls and our hand-rolled rubatà breadsticks.",
  },
  specials: { kicker: "This week", title: "This week's treats", empty: "This week's specials are coming soon." },
  categories: { title: "What comes out of our oven", pane: "Bread", focacce: "Focaccia", dolci: "Pastries", torte: "Cakes", stagionali: "Seasonal" },
  reviews: { kicker: "Kind words", title: "A smile is part of the recipe" },
  visit: {
    kicker: "Visit", title: "Come and see us",
    hours: "Opening hours", days: [["Mon · Tue · Thu · Fri · Sat", "7:15 – 12:45 · 16:00 – 19:30"], ["Wednesday", "7:15 – 12:45"], ["Sunday", "Closed"]],
    phone: "Call", instagram: "Instagram", facebook: "Facebook", directions: "Get directions",
  },
  shop: {
    title: "Our products", subtitle: "Order online, pick up in store.", all: "All", add: "Add", added: "Added",
    unavailable: "Sold out", advance: "Made to order", special: "This week", empty: "The catalogue is being updated.",
  },
  cart: { title: "Your order", empty: "Your cart is empty.", total: "Total", checkout: "Checkout", remove: "Remove", close: "Close" },
  checkout: {
    title: "Confirm your order", sectionYou: "Your details", sectionPickup: "When will you pick it up?", pickupOnly: "In-store pickup", payOnPickup: "You pay when you pick up.",
    disclaimer: "Small quantities can be ordered for the same day. Cakes, made-to-order items and large quantities must be requested at least one day in advance.",
    name: "Full name", email: "Email", phone: "Phone", contactHint: "Enter at least an email or a phone number: we'll let you know there when your order is accepted and when it's ready.",
    date: "Pickup day", time: "Pickup time", notes: "Notes (allergies, cake writing…)", submit: "Place order", sending: "Sending…",
    guest: "You're ordering as a guest.", login: "Log in", or: "or",
    success: "Order received!", successBody: "We'll let you know as soon as Marco and Anna accept it. Order number:",
    errors: { contact: "Enter an email or a phone number.", advance: "This order must be placed at least one day in advance: pick a date from tomorrow onwards.", past: "Pick a time in the future.", empty: "Your cart is empty.", generic: "Something went wrong, please try again or call us." },
  },
  account: {
    title: "Your account", login: "Log in", register: "Sign up", logout: "Log out", password: "Password", name: "Name",
    noAccount: "No account yet?", haveAccount: "Already have an account?", orders: "Your orders", noOrders: "No orders yet.",
    checkEmail: "Check your email to confirm your sign-up.",
    google: "Continue with Google", or: "or with email",
    dashboard: "Open the dashboard", dashboardHint: "Manage orders, products and shop performance.",
  },
  status: { received: "Received", preparing: "Being prepared", ready: "Ready", picked_up: "Picked up", cancelled: "Cancelled" },
  cookies: {
    title: "Cookies", accept: "Accept", reject: "Reject", more: "Read the policy", settings: "Cookie preferences",
    body: "We only use technical cookies the website needs. The Google Maps map, however, may set Google cookies: we only load it if you accept.",
    showMap: "Show the map", mapNote: "The map is provided by Google Maps, which may set cookies. Pressing the button accepts Google Maps cookies.",
  },
  footer: { privacy: "Privacy", rights: "All rights reserved.", made: "Made with sourdough and patience." },
  theme: { light: "Light theme", dark: "Dark theme" },
};

export const dictionaries: Record<Lang, Dict> = { it, en };
export type { Dict };

export const formatPrice = (cents: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-GB", { style: "currency", currency: "EUR" }).format(cents / 100);
