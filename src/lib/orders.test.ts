// Eseguire con: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { romeToUtc, validateOrder } from "./orders.ts";

test("romeToUtc gestisce ora solare e legale", () => {
  assert.equal(romeToUtc("2026-01-15", "08:30").toISOString(), "2026-01-15T07:30:00.000Z");
  assert.equal(romeToUtc("2026-07-15", "08:30").toISOString(), "2026-07-15T06:30:00.000Z");
});

const now = romeToUtc("2026-11-12", "09:00");
const base = { email: "a@b.it", now };

test("piccolo ordine in giornata ok", () => {
  assert.equal(validateOrder({ ...base, items: [{ quantity: 3, requires_advance: false }], pickupAt: romeToUtc("2026-11-12", "12:00") }), null);
});

test("torta in giornata rifiutata, il giorno dopo ok", () => {
  const items = [{ quantity: 1, requires_advance: true }];
  assert.equal(validateOrder({ ...base, items, pickupAt: romeToUtc("2026-11-12", "18:00") }), "advance");
  assert.equal(validateOrder({ ...base, items, pickupAt: romeToUtc("2026-11-13", "08:00") }), null);
});

test("grande quantità richiede il giorno prima", () => {
  assert.equal(validateOrder({ ...base, items: [{ quantity: 21, requires_advance: false }], pickupAt: romeToUtc("2026-11-12", "18:00") }), "advance");
});

test("serve un contatto e un orario futuro", () => {
  const items = [{ quantity: 1, requires_advance: false }];
  assert.equal(validateOrder({ items, now, pickupAt: romeToUtc("2026-11-12", "12:00") }), "contact");
  assert.equal(validateOrder({ ...base, items, pickupAt: romeToUtc("2026-11-12", "08:00") }), "past");
  assert.equal(validateOrder({ ...base, items: [], pickupAt: romeToUtc("2026-11-12", "12:00") }), "empty");
});
