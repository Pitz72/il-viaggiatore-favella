// ====================================================================
//  Prova del deposito delle opzioni (src/lib/opzioni.ts) dentro Node.
// --------------------------------------------------------------------
//  opzioni.ts non ha React né import: lo si trascrive da TypeScript e lo si
//  prova con un localStorage finto. I valori di base, la migrazione dalla voce
//  di prima (1.20 – 1.23, «viaggiatore.voce»), i valori guasti uno per uno, i
//  cambi che arrivano a chi ascolta, il ripristino, lo spazio negato.
//  Uso: node app/scripts/opzioni-node.mjs   (serve `npm ci --prefix app`)
// ====================================================================
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const sorgente = fs.readFileSync(path.join(qui, "..", "src", "lib", "opzioni.ts"), "utf8");
const js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "opzioni-"));
const file = path.join(tmp, "opzioni.mjs");
fs.writeFileSync(file, js);

// un localStorage finto, che può anche negare lo spazio
const cassetto = new Map();
let pieno = false;
globalThis.localStorage = {
  getItem: (k) => (cassetto.has(k) ? cassetto.get(k) : null),
  setItem: (k, v) => { if (pieno) throw new Error("QuotaExceededError"); cassetto.set(k, String(v)); },
  removeItem: (k) => { cassetto.delete(k); },
};

let O;
try {
  O = await import(pathToFileURL(file).href);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
const da = (contenuto) => { cassetto.clear(); for (const [k, v] of Object.entries(contenuto)) cassetto.set(k, v); O._dimentica(); return O.opzioni(); };
const BASE = O.OPZIONI_DI_BASE;
let prove = 0;
const ok = (nome) => { prove++; console.log(`ok  ${nome}`); };

// 1. senza niente: quelle di base, e la voce di sempre (recitata, al 100%)
assert.deepEqual(da({}), BASE);
assert.equal(BASE.voce, "recitata");
assert.equal(BASE.volumeVoce, 1);
ok("senza niente valgono le opzioni di base");

// 2. la voce di prima: «lettore» resta lettore; 0,9 (il valore di base di allora) diventa 100%; 0,45 diventa 50%
let o = da({ "viaggiatore.voce": JSON.stringify({ modo: "lettore", volume: 0.9 }) });
assert.equal(o.voce, "lettore");
assert.equal(o.volumeVoce, 1);
assert.equal(cassetto.has("viaggiatore.voce"), false, "la vecchia chiave si toglie");
assert.deepEqual(JSON.parse(cassetto.get("viaggiatore.opzioni")), o, "le opzioni migrate si scrivono");
o = da({ "viaggiatore.voce": JSON.stringify({ modo: "recitata", volume: 0.45 }) });
assert.equal(o.voce, "recitata");
assert.equal(o.volumeVoce, 0.5);
o = da({ "viaggiatore.voce": JSON.stringify({ modo: "strano", volume: "forte" }) });
assert.equal(o.voce, BASE.voce);
assert.equal(o.volumeVoce, BASE.volumeVoce);
ok("la voce della 1.20 – 1.23 si ritrova, e la vecchia chiave se ne va");

// 3. se c'è già il deposito nuovo, la vecchia chiave non conta
o = da({ "viaggiatore.opzioni": JSON.stringify({ voce: "recitata", volume: 0.6 }), "viaggiatore.voce": JSON.stringify({ modo: "lettore", volume: 0.2 }) });
assert.equal(o.voce, "recitata");
assert.equal(o.volume, 0.6);
assert.equal(o.volumeVoce, BASE.volumeVoce);
ok("il deposito nuovo vince sulla voce di prima");

// 4. i valori guasti tornano a quelli di base uno per uno, i buoni restano; i livelli vanno a passi di 0,05
o = da({ "viaggiatore.opzioni": JSON.stringify({ voce: 3, volume: 1.4, volumeMusica: -0.1, volumeVoce: 0.33, volumeEffetti: null, mono: "sì", secondoPiano: "silenzia" }) });
assert.deepEqual(o, { ...BASE, volumeVoce: 0.35, secondoPiano: "silenzia" });
assert.equal(da({ "viaggiatore.opzioni": JSON.stringify({ qualita: "altissima" }) }).qualita, "automatica");
assert.equal(da({ "viaggiatore.opzioni": JSON.stringify({ qualita: "bassa" }) }).qualita, "bassa");
assert.deepEqual(da({ "viaggiatore.opzioni": "{non è json" }), BASE);
assert.deepEqual(da({ "viaggiatore.opzioni": "[1,2,3]" }), BASE);
assert.deepEqual(da({ "viaggiatore.opzioni": "null" }), BASE);
ok("un valore guasto non rompe gli altri; un file guasto dà quelle di base");

// 5. un cambio si scrive, arriva a chi ascolta, e si ripulisce come una lettura
da({});
const sentite = [];
const smetti = O.ascoltaOpzioni((x) => sentite.push(x));
O.cambiaOpzioni({ volumeMusica: 0.42, mono: true });
assert.equal(O.opzioni().volumeMusica, 0.4);
assert.equal(O.opzioni().mono, true);
assert.equal(sentite.length, 1);
assert.deepEqual(JSON.parse(cassetto.get("viaggiatore.opzioni")), O.opzioni());
O.cambiaOpzioni({ volume: 7 });
assert.equal(O.opzioni().volume, BASE.volume, "un cambio fuori misura non passa");
smetti();
O.cambiaOpzioni({ voce: "lettore" });
assert.equal(sentite.length, 2, "chi ha smesso di ascoltare non sente più");
ok("i cambi si scrivono e arrivano a chi ascolta");

// 6. il ripristino
O.ripristinaOpzioni();
assert.deepEqual(O.opzioni(), BASE);
assert.deepEqual(JSON.parse(cassetto.get("viaggiatore.opzioni")), BASE);
ok("ripristina riporta tutto come al primo avvio");

// 6b. l'alta accessibilità: l'interruttore accende e spegne le cinque righe, e se ne cambia una dice «personalizzata»
da({});
assert.equal(O.altaAccessibilita(O.opzioni()), "no");
O.cambiaOpzioni(O.ACCESSIBILE);
assert.equal(O.altaAccessibilita(O.opzioni()), "si");
assert.deepEqual([O.opzioni().contrasto, O.opzioni().testo, O.opzioni().carattere, O.opzioni().movimento, O.opzioni().fuoco], ["alto", "grande", "atkinson", "ridotto", "marcato"]);
O.cambiaOpzioni({ fuoco: "normale" });
assert.equal(O.altaAccessibilita(O.opzioni()), "personalizzata");
O.cambiaOpzioni(O.NON_ACCESSIBILE);
assert.equal(O.altaAccessibilita(O.opzioni()), "no");
assert.deepEqual(O.opzioni(), BASE, "spenta, è come al primo avvio");
const guasta = da({ "viaggiatore.opzioni": JSON.stringify({ contrasto: "altissimo", testo: "grande", carattere: "comic", movimento: "fermo", fuoco: true }) });
assert.deepEqual([guasta.contrasto, guasta.testo, guasta.carattere, guasta.movimento, guasta.fuoco], ["normale", "grande", "lora", "sistema", "normale"]);
ok("l'alta accessibilità accende e spegne insieme le cinque righe; una cambiata la rende personalizzata");

// 6c. i comandi: di base pulsanti; i due modi si leggono; «entrambi» (c'era fino alla 1.36: pulsanti e riga insieme) e ogni modo guasto tornano a pulsanti
assert.equal(BASE.comandi, "pulsanti");
for (const m of ["pulsanti", "parole"]) assert.equal(da({ "viaggiatore.opzioni": JSON.stringify({ comandi: m }) }).comandi, m);
for (const m of ["entrambi", "tastiera", "", null, 2, ["parole"]]) assert.equal(da({ "viaggiatore.opzioni": JSON.stringify({ comandi: m }) }).comandi, "pulsanti");
da({});
O.cambiaOpzioni({ ...O.ACCESSIBILE, comandi: "parole" });
assert.equal(O.altaAccessibilita(O.opzioni()), "si", "il modo dei comandi non conta per l'alta accessibilità");
O.ripristinaOpzioni();
assert.equal(O.opzioni().comandi, "pulsanti");
ok("i due modi dei comandi; «pulsanti e parole» di prima e un modo guasto tornano a pulsanti");

// 7. lo spazio negato: le opzioni valgono lo stesso finché il gioco è aperto, e la vecchia voce non si perde
pieno = true;
o = da({ "viaggiatore.voce": JSON.stringify({ modo: "lettore", volume: 0.9 }) });
assert.equal(o.voce, "lettore");
assert.equal(cassetto.has("viaggiatore.voce"), true, "senza spazio la vecchia chiave resta");
O.cambiaOpzioni({ volume: 0.3 });
assert.equal(O.opzioni().volume, 0.3);
pieno = false;
ok("senza spazio le opzioni valgono fino alla chiusura");

console.log(`\n${prove} prove superate`);
