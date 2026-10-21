// ====================================================================
//  Prova della sequenza finale (src/finale/scaletta.ts, src/finale/crediti.ts) dentro Node.
// --------------------------------------------------------------------
//  I due file non hanno React né import: si trascrivono da TypeScript e si
//  provano. La scaletta: almeno 1:20 (Simone) per ogni durata della canzone,
//  le fasi in ordine, la canzone e i due loghi dentro la sequenza, i titoli
//  abbastanza lunghi da leggersi; le durate dei loghi uguali a quelle dei
//  componenti (loghi/LogoRuntime.tsx, loghi/LogoFavella.tsx). I crediti: le
//  righe del vecchio cartello d'avvio, «elevenlabs.io» compreso, e la canzone
//  al suo posto quando c'è. Piano: pre-produzione/11-sequenza-finale.md.
//  Uso: node app/scripts/finale-node.mjs   (serve `npm ci --prefix app`)
// ====================================================================
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(qui, "..", "src");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "finale-"));
const carica = async (rel) => {
  const js = ts.transpileModule(fs.readFileSync(path.join(src, rel), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  const file = path.join(tmp, path.basename(rel).replace(/\.ts$/, ".mjs"));
  fs.writeFileSync(file, js);
  return import(pathToFileURL(file).href);
};
let S, C;
try {
  S = await carica("finale/scaletta.ts");
  C = await carica("finale/crediti.ts");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

let n = 0;
const prova = (nome, f) => { f(); n++; console.log("OK " + nome); };

// ── la scaletta ──────────────────────────────────────────────────────
prova("le durate dei loghi sono quelle dei componenti", () => {
  const r = fs.readFileSync(path.join(src, "loghi", "LogoRuntime.tsx"), "utf8").match(/export const DURATA_RUNTIME = ([\d.]+);/);
  const f = fs.readFileSync(path.join(src, "loghi", "LogoFavella.tsx"), "utf8").match(/export const DURATA_FAVELLA = ([\d.]+);/);
  assert.equal(Number(r[1]), S.DURATA_RUNTIME);
  assert.equal(Number(f[1]), S.DURATA_FAVELLA);
});

for (const canzone of [null, 30, 88.5, 100, 120, 150, 180]) {
  prova(`canzone di ${canzone ?? "nessuna durata"}: almeno 1:20, fasi in ordine, tutto dentro`, () => {
    const T = S.tempi(canzone);
    assert.ok(T.durata >= 80, `dura ${T.durata} s`);
    assert.ok(T.durata >= S.MINIMO);
    if (canzone) assert.ok(S.ATTACCO + canzone <= T.durata, "la canzone finisce dentro la sequenza");
    const fila = [T.scenaDa, T.scenaA, T.fraseDa, T.fraseA];
    for (let i = 1; i < fila.length; i++) assert.ok(fila[i - 1] < fila[i], `fila ${fila}`);
    assert.ok(T.bandeDa < T.bandeA && T.bandeA <= T.fraseDa, "le bande sono chiuse prima della frase");
    assert.ok(T.notteDa < T.notteA && T.notteDa < T.fraseA, "la notte comincia mentre la frase svanisce");
    assert.ok(T.fraseA <= T.titoliDa && T.titoliDa < T.titoloFermoA && T.titoloFermoA < T.titoliA, "il titolo arriva dopo la frase");
    assert.ok(T.titoliA - 4 - T.titoloFermoA >= 30, `i titoli salgono per ${T.titoliA - 4 - T.titoloFermoA} s: troppo pochi`);
    assert.ok(T.titoliA <= T.neroDa && T.neroDa < T.runtimeDa, "il nero prima dei loghi");
    assert.ok(T.runtimeDa + S.DURATA_RUNTIME <= T.favellaDa + 1e-9, "Runtime finisce prima di FAVELLA");
    assert.ok(T.favellaDa + S.DURATA_FAVELLA <= T.durata, "FAVELLA finisce dentro la sequenza");
  });
}

prova("presenza: zero fuori, uno dentro, rampe", () => {
  assert.equal(S.presenza(0, 1, 5, 1, 1), 0);
  assert.equal(S.presenza(6, 1, 5, 1, 1), 0);
  assert.equal(S.presenza(3, 1, 5, 1, 1), 1);
  assert.equal(S.presenza(1.5, 1, 5, 1, 1), 0.5);
  assert.equal(S.presenza(4.75, 1, 5, 1, 1), 0.25);
});

// ── i crediti ────────────────────────────────────────────────────────
const VOCI_DEL_CARTELLO = ["Il Viaggiatore", "Storia, testi, musica dell'intro, grafica", "Musiche delle zone", "Voci",
  "Imma, Rosaria, Tore e Vito", "Codice", "Motore", "Componenti", "Marchi"];
prova("le righe del vecchio cartello d'avvio, tutte e nell'ordine", () => {
  assert.deepEqual(C.CREDITI.map(([che]) => che), VOCI_DEL_CARTELLO);
});
prova("l'attribuzione delle voci ElevenLabs c'è", () => {
  assert.ok(C.CREDITI.some(([che, chi]) => che.includes("Imma") && chi.includes("elevenlabs.io")));
});
prova("la canzone compare dopo le musiche delle zone, e solo se c'è", () => {
  const con = C.righeDeiTitoli(true), senza = C.righeDeiTitoli(false);
  assert.equal(senza.length, C.CREDITI.length);
  assert.equal(con.length, C.CREDITI.length + 1);
  assert.equal(con[3], C.CANZONE);
  assert.equal(con[2][0], "Musiche delle zone");
  assert.ok(!senza.includes(C.CANZONE));
});
prova("in coda: dove stanno le licenze, e il grazie", () => {
  assert.match(C.LICENZE, /github\.com\/Pitz72\/il-viaggiatore-favella/);
  assert.equal(C.GRAZIE, "Grazie per aver giocato.");
});

console.log(`\nTUTTO OK (${n} prove)`);
