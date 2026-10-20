// ====================================================================
//  Prova dei posti dei salvataggi (src/lib/posti.ts) dentro Node.
// --------------------------------------------------------------------
//  posti.ts non ha import: lo si trascrive da TypeScript e lo si prova. I
//  generi, i nomi validi e quelli no (gli stessi che accetta il processo
//  principale: desktop/salvataggi.cjs, POSTO), i posti nuovi, i nomi che vede
//  chi gioca, la rotazione dei tre automatici, il tempo di gioco a parole.
//  Uso: node app/scripts/posti-node.mjs   (serve `npm ci --prefix app`)
// ====================================================================
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const sorgente = fs.readFileSync(path.join(qui, "..", "src", "lib", "posti.ts"), "utf8");
const js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "posti-"));
const file = path.join(tmp, "posti.mjs");
fs.writeFileSync(file, js);
let P;
try { P = await import(pathToFileURL(file).href); } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

// l'elenco del processo principale, letto dal suo file senza avviare Electron
const testoMain = fs.readFileSync(path.join(qui, "..", "..", "desktop", "salvataggi.cjs"), "utf8");
const POSTO = new Function(`return ${/const POSTO = (\/.*\/);/.exec(testoMain)[1]}`)();

let prove = 0;
const ok = (nome) => { prove++; console.log(`ok  ${nome}`); };

// 1. i generi
assert.equal(P.genere("rapido"), "rapido");
for (const p of ["automatico-1", "automatico-2", "automatico-3", "automatico", "auto"]) assert.equal(P.genere(p), "automatico", p);
for (const p of ["posto-1", "posto-6", "3", "s-20261020-234512-a9z0"]) assert.equal(P.genere(p), "manuale", p);
ok("rapido, automatici (anche quelli di prima) e salvataggi con nome");

// 2. i nomi validi, e che il processo principale accetti gli stessi file (quelli del browser, «auto» e «1»…«6», solo la pagina)
const buoni = ["rapido", "automatico-1", "automatico-3", "automatico", "posto-1", "posto-6", "s-20261020-234512-a9z0"];
const cattivi = ["", "automatico-4", "automatico-0", "posto-7", "posto-0", "s-2026-1", "s-20261020-234512-A9Z0", "../rapido", "rapido.bak",
  "s-20261020-234512-a9z0/../x", "rapido ", "CON", null, 7];
for (const p of buoni) { assert.equal(P.postoValido(p), true, p); assert.equal(POSTO.test(p), true, `main: ${p}`); }
for (const p of cattivi) { assert.equal(P.postoValido(p), false, String(p)); if (typeof p === "string") assert.equal(POSTO.test(p), false, `main: ${p}`); }
for (const p of ["auto", "1", "6"]) { assert.equal(P.postoValido(p), true, p); assert.equal(POSTO.test(p), false, `main non deve accettare ${p}`); }
ok("i nomi validi sono gli stessi nella pagina e nel processo principale");

// 3. un posto nuovo: l'istante e quattro caratteri; due nello stesso secondo non coincidono
const ora = new Date(2026, 9, 20, 23, 45, 7);
let n = 0;
const a = P.nuovoPosto(ora, () => (n++ % 36) / 36), b = P.nuovoPosto(ora, () => 0.999);
assert.match(a, /^s-20261020-234507-[0-9a-z]{4}$/);
assert.equal(a, "s-20261020-234507-0123");
assert.notEqual(a, b);
assert.equal(P.postoValido(P.nuovoPosto()), true);
assert.equal(POSTO.test(P.nuovoPosto()), true);
ok("i posti nuovi hanno l'istante nel nome, e il main li accetta");

// 4. i nomi che vede chi gioca
assert.equal(P.nomeDi("s-20261020-234507-0123", "  Il pozzo   di Saverio ", "Il pozzo"), "Il pozzo di Saverio");
assert.equal(P.nomeDi("s-20261020-234507-0123", "", "Il pozzo"), "Il pozzo");
assert.equal(P.nomeDi("rapido"), "Salvataggio rapido");
assert.equal(P.nomeDi("automatico-2"), "Salvataggio automatico");
assert.equal(P.nomeDi("automatico"), "Salvataggio automatico");
assert.equal(P.nomeDi("posto-4"), "Posto 4");
assert.equal(P.nomeDi("4"), "Posto 4");
assert.equal(P.pulisciNome("x".repeat(90)).length, P.LUNGHEZZA_NOME);
assert.equal(P.pulisciNome("riga\nsotto\tqui"), "riga sotto qui");
assert.equal(P.pulisciNome(42), "");
ok("il nome: quello dato, se no il genere del posto, se no il luogo; una riga sola, al massimo 60 caratteri");

// 5. la rotazione: dopo l'ultimo scritto viene il più vecchio; senza sapere niente si comincia dal primo
assert.equal(P.prossimoAutomatico(null), 0);
assert.equal(P.prossimoAutomatico(0), 1);
assert.equal(P.prossimoAutomatico(1), 2);
assert.equal(P.prossimoAutomatico(2), 0);
for (const strano of [-1, 3, 1.5, NaN]) assert.equal(P.prossimoAutomatico(strano), 0, String(strano));
let giro = null; const scritti = [];
for (let i = 0; i < 7; i++) { giro = P.prossimoAutomatico(giro); scritti.push(P.AUTOMATICI[giro]); }
assert.deepEqual(scritti, ["automatico-1", "automatico-2", "automatico-3", "automatico-1", "automatico-2", "automatico-3", "automatico-1"]);
ok("i tre automatici girano: si riscrive sempre il più vecchio");

// 6. il tempo di gioco
assert.equal(P.durataLeggibile(undefined), "—");
assert.equal(P.durataLeggibile(-5), "—");
assert.equal(P.durataLeggibile(59_000), "meno di un minuto");
assert.equal(P.durataLeggibile(14 * 60_000 + 30_000), "14 min");
assert.equal(P.durataLeggibile(125 * 60_000), "2 h 05 min");
ok("il tempo di gioco a parole brevi");

console.log(`\n${prove} prove superate`);
