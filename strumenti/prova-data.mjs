// Prova di dataLocale (strumenti/data-locale.mjs): node strumenti/prova-data.mjs
// Il fuso si fissa PRIMA di qualunque Date: Node lo rilegge da process.env.TZ.
import assert from "node:assert/strict";

process.env.TZ = "Europe/Rome";
const { dataLocale } = await import("./data-locale.mjs");

// 19 ottobre, 23:30 UTC = 20 ottobre, 01:30 in Italia (ora legale): è il caso che la 1.15.0 ha sbagliato
const notte = new Date("2026-10-19T23:30:00Z");
assert.equal(notte.toISOString().slice(0, 10), "2026-10-19", "(in UTC è ancora il 19: il difetto di prima)");
assert.equal(dataLocale(notte), "2026-10-20");

// d'inverno (ora solare, UTC+1) fra le 23:00 e mezzanotte UTC è già il giorno dopo
assert.equal(dataLocale(new Date("2026-01-31T23:10:00Z")), "2026-02-01");
// di giorno non cambia niente, e giorno e mese a una cifra hanno lo zero
assert.equal(dataLocale(new Date("2026-03-05T12:00:00Z")), "2026-03-05");
// l'ultima sera dell'anno, un'ora prima del cambio in Italia, è ancora il 31
assert.equal(dataLocale(new Date("2026-12-31T22:30:00Z")), "2026-12-31");
assert.equal(dataLocale(new Date("2026-12-31T23:30:00Z")), "2027-01-01");

// il contrario, a ovest di Greenwich: in California alle 20 del 19 è già il 20 in UTC
process.env.TZ = "America/Los_Angeles";
assert.equal(dataLocale(new Date("2026-10-20T03:00:00Z")), "2026-10-19");

console.log("ok  dataLocale segue il fuso di chi lavora (Europe/Rome, America/Los_Angeles)");
