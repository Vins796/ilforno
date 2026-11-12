import "server-only";
import type { Order, OrderStatus } from "./types";
import { TZ } from "./orders";

// Email con Resend, SMS con Twilio. Se le chiavi mancano il messaggio viene solo loggato.

const texts: Partial<Record<OrderStatus, Record<"it" | "en", (o: Order, when: string) => string>>> = {
  preparing: {
    it: (o, w) => `Ciao ${o.customer_name}! Il Forno ha preso in carico il tuo ordine n. ${o.number}. Sarà pronto per il ritiro ${w}.`,
    en: (o, w) => `Hi ${o.customer_name}! Il Forno has accepted your order #${o.number}. It will be ready for pickup ${w}.`,
  },
  ready: {
    it: (o) => `Il tuo ordine n. ${o.number} è pronto! Ti aspettiamo da Il Forno, Poirino.`,
    en: (o) => `Your order #${o.number} is ready! See you at Il Forno, Poirino.`,
  },
  cancelled: {
    it: (o) => `Ci dispiace, il tuo ordine n. ${o.number} è stato annullato. Chiamaci per qualsiasi dubbio.`,
    en: (o) => `Sorry, your order #${o.number} has been cancelled. Give us a call with any questions.`,
  },
};

export async function notifyCustomer(order: Order) {
  const text = texts[order.status]?.[order.lang];
  if (!text) return;
  const when = new Intl.DateTimeFormat(order.lang === "it" ? "it-IT" : "en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(order.pickup_at));
  const body = text(order, when);

  // Email se c'è, altrimenti SMS
  if (order.email) await sendEmail(order.email, order.lang === "it" ? `Ordine n. ${order.number} — Il Forno` : `Order #${order.number} — Il Forno`, body);
  else if (order.phone) await sendSms(order.phone, body);
}

async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return console.info("[notify] email non configurata →", to, text);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) console.error("[notify] email fallita", res.status, await res.text());
}

async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return console.info("[notify] SMS non configurato →", to, body);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
    body: new URLSearchParams({ To: normalizePhone(to), From: from, Body: body }),
  });
  if (!res.ok) console.error("[notify] SMS fallito", res.status, await res.text());
}

/** "333 123 4567" → "+393331234567" (default Italia). */
const normalizePhone = (p: string) => {
  const digits = p.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : digits.startsWith("00") ? `+${digits.slice(2)}` : `+39${digits}`;
};
