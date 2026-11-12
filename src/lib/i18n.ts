export const locales = ["it", "en"] as const;
export type Lang = (typeof locales)[number];
export const isLang = (v: string): v is Lang => (locales as readonly string[]).includes(v);

const it = {
  nav: { home: "Home", shop: "Prodotti", about: "Chi siamo", visit: "Dove siamo", account: "Account", cart: "Carrello" },
  hero: { kicker: "Panetteria a Poirino dal cuore", title: "Il pane come si faceva, con la gentilezza di sempre.", cta: "Ordina e ritira", secondary: "La nostra storia" },
  about: {
    kicker: "Chi siamo",
    title: "Marco e Anna",
    body: [
      "Siamo cresciuti a Poirino e qui abbiamo scelto di restare. Marco ha imparato il mestiere proprio tra queste mura, impastando per anni accanto a chi c'era prima di noi.",
      "Tre anni fa Anna — la mente diabolica dietro a tutto — ha avuto l'idea: rilevare il forno e farlo nostro. Da allora custodiamo le ricette della tradizione piemontese e ci divertiamo a proporre ogni settimana qualcosa di nuovo.",
      "Ma la cosa a cui teniamo di più è semplice: che chi entra si senta accolto, come a casa.",
    ],
    values: ["Ricette del territorio", "Lievitazioni lente", "Accoglienza prima di tutto"],
  },
  specials: { kicker: "Questa settimana", title: "Le chicche della settimana", empty: "Le novità della settimana arrivano a breve." },
  categories: { title: "Cosa sforniamo", pane: "Pane", focacce: "Focacce", dolci: "Dolci", torte: "Torte", stagionali: "Stagionali" },
  reviews: { kicker: "Dicono di noi", title: "Il sorriso fa parte della ricetta" },
  visit: {
    kicker: "Dove siamo", title: "Vieni a trovarci",
    // shortcut: orari di apertura provvisori; i giorni di chiusura (mercoledì pomeriggio, domenica) sono quelli veri
    hours: "Orari", days: [["Lun · Mar · Gio · Ven · Sab", "6:30 – 13:00 · 16:00 – 19:30"], ["Mercoledì", "6:30 – 13:00"], ["Domenica", "Chiuso"]],
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
    dashboard: "Apri la dashboard", dashboardHint: "Gestisci ordini, prodotti e andamento del negozio.",
  },
  status: { received: "Ricevuto", preparing: "In preparazione", ready: "Pronto", picked_up: "Ritirato", cancelled: "Annullato" },
  footer: { rights: "Tutti i diritti riservati.", made: "Fatto con lievito madre e pazienza." },
  theme: { light: "Tema chiaro", dark: "Tema scuro" },
};

type Dict = typeof it;

const en: Dict = {
  nav: { home: "Home", shop: "Products", about: "About us", visit: "Visit", account: "Account", cart: "Cart" },
  hero: { kicker: "A bakery in Poirino, made with heart", title: "Bread the way it used to be, with the kindness of always.", cta: "Order & pick up", secondary: "Our story" },
  about: {
    kicker: "About us",
    title: "Marco & Anna",
    body: [
      "We grew up in Poirino and chose to stay. Marco learned his craft within these very walls, kneading dough for years alongside the bakers who came before us.",
      "Three years ago Anna — the evil genius behind it all — had the idea: take over the bakery and make it ours. Since then we have kept Piedmont's traditional recipes alive, and every week we enjoy baking something new.",
      "What matters most to us is simple: that everyone who walks in feels welcome, like at home.",
    ],
    values: ["Local recipes", "Slow fermentation", "Hospitality first"],
  },
  specials: { kicker: "This week", title: "This week's treats", empty: "This week's specials are coming soon." },
  categories: { title: "What comes out of our oven", pane: "Bread", focacce: "Focaccia", dolci: "Pastries", torte: "Cakes", stagionali: "Seasonal" },
  reviews: { kicker: "Kind words", title: "A smile is part of the recipe" },
  visit: {
    kicker: "Visit", title: "Come and see us",
    hours: "Opening hours", days: [["Mon · Tue · Thu · Fri · Sat", "6:30 – 13:00 · 16:00 – 19:30"], ["Wednesday", "6:30 – 13:00"], ["Sunday", "Closed"]],
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
    dashboard: "Open the dashboard", dashboardHint: "Manage orders, products and shop performance.",
  },
  status: { received: "Received", preparing: "Being prepared", ready: "Ready", picked_up: "Picked up", cancelled: "Cancelled" },
  footer: { rights: "All rights reserved.", made: "Made with sourdough and patience." },
  theme: { light: "Light theme", dark: "Dark theme" },
};

export const dictionaries: Record<Lang, Dict> = { it, en };
export type { Dict };

export const formatPrice = (cents: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-GB", { style: "currency", currency: "EUR" }).format(cents / 100);
