// ====================================================================
//  Prove dei trofei dentro Node: le regole (src/gioco/trofei.ts) nei casi
//  che le partite di collaudo/trofei.py non toccano, e il deposito
//  (src/lib/trofei.ts) con un localStorage finto.
// --------------------------------------------------------------------
//  Le sfide lette da un salvataggio (anche vecchio o guasto), il caricamento
//  che torna indietro, «Mani pulite» col fratello abbattuto, i trofei già
//  vinti che non tornano, la collezione; il deposito: valori guasti, trofei
//  che non esistono, il punto più lontano che cresce soltanto, l'azzeramento
//  che lascia i viaggi, lo spazio negato.
//  Uso: node app/scripts/trofei-prove.mjs   (serve `npm ci --prefix app`)
// ====================================================================
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(qui, "..", "src");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "trofei-prove-"));
// i due file, trascritti con la stessa disposizione delle cartelle (lib/trofei importa gioco/trofei)
for (const [da, a] of [["gioco/trofei.ts", "gioco/trofei.mjs"], ["lib/trofei.ts", "lib/trofei.mjs"]]) {
  const js = ts.transpileModule(fs.readFileSync(path.join(src, da), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
    .replace(/from "\.\.\/gioco\/trofei"/g, 'from "../gioco/trofei.mjs"');
  fs.mkdirSync(path.dirname(path.join(tmp, a)), { recursive: true });
  fs.writeFileSync(path.join(tmp, a), js);
}

const cassetto = new Map();
let pieno = false;
globalThis.window = {};
globalThis.localStorage = {
  getItem: (k) => (cassetto.has(k) ? cassetto.get(k) : null),
  setItem: (k, v) => { if (pieno) throw new Error("QuotaExceededError"); cassetto.set(k, String(v)); },
  removeItem: (k) => { cassetto.delete(k); },
};

let R, D;
try {
  R = await import(pathToFileURL(path.join(tmp, "gioco/trofei.mjs")).href);
  D = await import(pathToFileURL(path.join(tmp, "lib/trofei.mjs")).href);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
let prove = 0;
const ok = (nome) => { prove++; console.log(`ok  ${nome}`); };

// ── le sfide ────────────────────────────────────────────────────────────────
const ROTTE = { scritto: true, toccato: true, indietro: true, italiano: true, fuoriTesto: true };
assert.deepEqual(R.sfideNuove("v-abc"), { id: "v-abc", scritto: false, toccato: false, indietro: false, italiano: false, fuoriTesto: false });
assert.deepEqual(R.pulisciSfide(undefined, "v-nuovo"), { id: "v-nuovo", ...ROTTE });
assert.deepEqual(R.pulisciSfide({ id: "Ã¨ strano!", scritto: false }, "v-nuovo"), { id: "v-nuovo", ...ROTTE });
assert.deepEqual(R.pulisciSfide({ id: "v-buono", scritto: true, toccato: false, indietro: false, italiano: false, fuoriTesto: false }, "x"),
  { id: "v-buono", scritto: true, toccato: false, indietro: false, italiano: false, fuoriTesto: false });
assert.deepEqual(R.pulisciSfide({ id: "v-buono", scritto: true, toccato: false, indietro: false }, "x"),
  { id: "v-buono", scritto: true, toccato: false, indietro: false, italiano: true, fuoriTesto: true }, "un salvataggio di prima della 1.40: «Parola per parola» rotta");
assert.deepEqual(R.pulisciSfide({ id: "v-buono", scritto: "sì" }, "x"), { id: "v-buono", ...ROTTE }, "un valore guasto rompe quella sfida");
ok("le sfide di un salvataggio: senza (prima della 1.30) o guaste, rotte; buone, com'erano");

const salvate = { id: "v-uno", scritto: true, toccato: false, indietro: false };
assert.equal(R.sfideCaricate(salvate, 50, () => 80, "x").indietro, true, "caricare il punto 50 dopo essere arrivati a 80");
assert.equal(R.sfideCaricate(salvate, 80, () => 80, "x").indietro, false, "lo stesso punto non è tornare indietro");
assert.equal(R.sfideCaricate(salvate, 90, () => 80, "x").indietro, false, "un punto più avanti nemmeno");
assert.equal(R.sfideCaricate(salvate, 50, (v) => (v === "v-uno" ? 0 : 999), "x").indietro, false, "conta il viaggio del salvataggio, non un altro");
assert.equal(R.sfideCaricate(undefined, 50, () => 0, "v-nuovo").indietro, true);
ok("caricare un punto prima del più lontano raggiunto è tornare indietro; lo stesso punto o uno dopo, no");

// ── le regole, nei casi che le partite non toccano ─────────────────────────
const FIN = (frase) => `Testo della soglia.\nFINALE — ${frase}`;
const turno = (x) => ({ testo: "", esito: "in_corso", counters: {}, voci: [], gesti: {}, stati: {}, sfide: R.sfideNuove("v-t"), ...x });
const vinti = (x, gia = []) => R.trofeiDelTurno(turno(x), new Set(gia));

let v = vinti({ testo: FIN("Sei entrato ad Acquamorta sopra il corpo di tuo fratello. La casa è tua."), esito: "terminata",
  counters: { sangue: 0 }, stati: { "stato di cosimo": "abbattuto" } });
assert.ok(v.includes("sopra-il-corpo") && !v.includes("mani-pulite"), `col fratello abbattuto niente «Mani pulite»: ${v}`);
v = vinti({ testo: FIN("Sei arrivato a casa con le mani vuote, e la casa se n'è accorta."), esito: "terminata",
  counters: { sangue: 1 }, stati: { "stato di cosimo": "riconosciuto" } });
assert.ok(v.includes("le-mani-vuote") && !v.includes("mani-pulite"), "col sangue nemmeno");
v = vinti({ testo: FIN("Sei arrivato a casa con le mani vuote, e la casa se n'è accorta."), esito: "terminata",
  counters: { sangue: 0 }, stati: { "stato di cosimo": "riconosciuto" } });
assert.ok(v.includes("mani-pulite"));
ok("«Mani pulite»: un finale senza sangue e senza aver sparato al fratello");

const finaleA = { testo: FIN("Hai trovato la casa, e hai scelto di non restarci. Qualcuno, almeno, lo porti via vivo."), esito: "vinta", counters: { sangue: 0 } };
const sf = (scritto, toccato, indietro) => ({ id: "v-t", scritto, toccato, indietro });
assert.deepEqual(vinti({ ...finaleA, sfide: sf(true, true, false) }).filter((i) => i.startsWith("tutto")), [], "mescolando, nessuna delle due");
assert.ok(vinti({ ...finaleA, sfide: sf(false, false, false) }).every((i) => !i.startsWith("tutto")), "senza comandi (non succede), nessuna");
assert.ok(!vinti({ ...finaleA, sfide: sf(true, false, true) }).includes("senza-voltarti"));
assert.ok(vinti({ ...finaleA, sfide: sf(true, false, false) }).includes("tutto-a-parole"));
assert.ok(!vinti({ testo: "Bevi.", sfide: sf(true, false, false) }).includes("tutto-a-parole"), "le sfide solo su un finale della storia");
assert.ok(!vinti({ testo: "Non hai più la forza di rialzarti.\nLa fame ti ha fermato lungo la strada.", esito: "persa", sfide: sf(true, false, false) }).some((i) => ["senza-voltarti", "tutto-a-parole"].includes(i)),
  "una morte non è un finale della storia");
ok("le sfide valgono solo su un finale della storia, e si rompono come devono");

// «Parola per parola»: solo in inglese (nessun comando dato in italiano) e senza strade nominate prese dalla rosa
const sfEn = (italiano, fuoriTesto) => ({ id: "v-t", scritto: false, toccato: true, indietro: false, italiano, fuoriTesto });
assert.ok(vinti({ ...finaleA, sfide: sfEn(false, false) }).includes("parola-per-parola"));
assert.ok(!vinti({ ...finaleA, sfide: sfEn(true, false) }).includes("parola-per-parola"), "un comando in italiano la fa cadere");
assert.ok(!vinti({ ...finaleA, sfide: sfEn(false, true) }).includes("parola-per-parola"), "una strada nominata presa dalla rosa pure");
assert.ok(!vinti({ ...finaleA, sfide: sf(false, true, false) }).includes("parola-per-parola"), "sfide senza le due righe (un collaudo vecchio): no");
assert.ok(!vinti({ testo: "Bevi.", sfide: sfEn(false, false) }).includes("parola-per-parola"), "solo su un finale della storia");
const it = R.trofeiDellaLingua("it").map((t) => t.id), en = R.trofeiDellaLingua("en").map((t) => t.id);
assert.equal(R.TROFEI.length, 31);
assert.ok(it.length === 30 && en.length === 30, "trenta per lingua");
assert.ok(it.includes("tutto-a-parole") && !it.includes("parola-per-parola") && en.includes("parola-per-parola") && !en.includes("tutto-a-parole"));
ok("«Parola per parola» (solo in inglese): si vince e si rompe come deve; trenta trofei per lingua");

assert.deepEqual(vinti({ gesti: { Saverio: ["cibo"] } }), ["senza-un-grazie"]);
assert.deepEqual(vinti({ gesti: { Saverio: ["cibo"] } }, ["senza-un-grazie"]), [], "un trofeo vinto non torna");
assert.deepEqual(vinti({ gesti: { Nessuno: ["niente"] }, stati: { "stato del riconoscimento": "nessuno" } }), [], "gesti e stati che non sono trofei non contano");
assert.deepEqual(vinti({ testo: "Il viaggio finisce qui." }), [], "la frase della fine conta solo se la partita è persa");
ok("i trofei vinti non tornano; ciò che non è un trofeo non conta");

const sei = R.FINALI.map(([, id]) => id);
assert.ok(vinti(finaleA, sei.filter((i) => i !== "qualcuno-lo-porti-via")).includes("tutte-le-strade"), "col sesto finale, «Tutte le strade»");
const tutti = R.TROFEI.map((t) => t.id).filter((i) => !["il-viaggiatore", "detto-il-vero"].includes(i));
v = vinti({ stati: { "stato del sapere di peppe": "vero" } }, tutti);
assert.deepEqual(v, ["detto-il-vero", "il-viaggiatore"], "con l'ultimo che mancava, «Il viaggiatore»");
assert.ok(!vinti({ stati: { "stato del sapere di peppe": "vero" } }, tutti.slice(1)).includes("il-viaggiatore"), "se ne manca uno, no");
const senzaLaSfidaItaliana = tutti.filter((i) => i !== "tutto-a-parole");
assert.deepEqual(vinti({ stati: { "stato del sapere di peppe": "vero" } }, senzaLaSfidaItaliana), ["detto-il-vero", "il-viaggiatore"],
  "con «Parola per parola» al posto di «Tutto a parole», la collezione è la stessa");
assert.ok(!vinti({ stati: { "stato del sapere di peppe": "vero" } }, tutti.filter((i) => !R.SOLO_IN[i])).includes("il-viaggiatore"),
  "senza nessuna delle due sfide di una lingua sola, no");
ok("la collezione: «Tutte le strade» col sesto finale, «Il viaggiatore» con l'ultimo trofeo, l'una o l'altra sfida di lingua");

// ── il deposito ────────────────────────────────────────────────────────────
const p = D.pulisciDeposito({ vinti: { "le-mani-vuote": "2026-10-21T03:00:00.000Z", "non-esiste": "2026-10-21T03:00:00.000Z", "la-lettera": "ieri", "affare-fatto": 7 },
  viaggi: { "v-buono": 12, "V MALE": 3, "v-meno": -1, "v-frazione": 2.5, ...Object.fromEntries(Array.from({ length: 45 }, (_, i) => [`v-viaggio-${i}`, i])), "V ULTIMO": 9 } });
assert.deepEqual(Object.keys(p.vinti), ["le-mani-vuote"], "solo i trofei che esistono, con una data vera");
assert.equal(Object.keys(p.viaggi).length, 40, "si ricordano gli ultimi quaranta viaggi buoni");
assert.ok("v-viaggio-44" in p.viaggi && !("v-viaggio-4" in p.viaggi), "i più recenti");
assert.ok(!("V MALE" in p.viaggi) && !("v-meno" in p.viaggi) && !("v-frazione" in p.viaggi));
assert.deepEqual(D.pulisciDeposito("guasto"), { vinti: {}, viaggi: {} });
assert.deepEqual(D.pulisciDeposito(null), { vinti: {}, viaggi: {} });
ok("il deposito letto da un file guasto tiene solo ciò che è buono");

cassetto.set("viaggiatore.trofei", JSON.stringify({ vinti: { "la-lettera": "2026-10-20T10:00:00.000Z" }, viaggi: { "v-viaggio-a": 30 } }));
assert.deepEqual(Object.keys((await D.deposito()).vinti), ["la-lettera"]);
let avvisi = 0;
const smetti = D.ascoltaTrofei(() => { avvisi++; });
assert.deepEqual(await D.vinci(["la-lettera", "la-febbre-rotta", "inventato"]), ["la-febbre-rotta"], "solo i nuovi, e solo quelli che esistono");
assert.equal(avvisi, 1);
assert.equal(JSON.parse(cassetto.get("viaggiatore.trofei")).vinti["la-lettera"], "2026-10-20T10:00:00.000Z", "la data di un trofeo già vinto non cambia");
assert.deepEqual(await D.vinci(["la-febbre-rotta"]), []);
await D.segnaLontano("v-viaggio-a", 20);
assert.equal(D.piuLontano("v-viaggio-a"), 30, "il punto più lontano cresce soltanto");
await D.segnaLontano("v-viaggio-a", 45);
assert.equal(D.piuLontano("v-viaggio-a"), 45);
assert.equal(D.piuLontano("v-mai-visto"), 0);
await D.azzeraTrofei();
assert.deepEqual(JSON.parse(cassetto.get("viaggiatore.trofei")).vinti, {}, "azzerati");
assert.equal(D.piuLontano("v-viaggio-a"), 45, "i viaggi restano");
smetti();
ok("il deposito: vincere, il punto più lontano, l'azzeramento");

pieno = true;
await assert.rejects(() => D.vinci(["la-lettera"]), /Quota/, "senza spazio la scrittura fallisce, e lo si dice");
assert.ok((await D.deposito()).vinti["la-lettera"], "ma in memoria il trofeo c'è, fino alla chiusura");
pieno = false;
ok("senza spazio il trofeo vale fino alla chiusura");

assert.match(D.nuovoViaggio(), /^[0-9a-z-]{4,40}$/);
assert.notEqual(D.nuovoViaggio(), D.nuovoViaggio());
ok("un viaggio nuovo ha un id valido per le sfide e per il deposito");

console.log(`\n${prove} prove superate`);
