// ====================================================================
//  Il foglio della mappa (src/gioco/foglio.ts) dentro Node, per i collaudi.
// --------------------------------------------------------------------
//  Serve a collaudo/mappa.py: il ponte vero dà la carta e i luoghi visitati,
//  questa logica, la stessa del gioco, dice che cosa va sul foglio e dove. Una
//  riga JSON per domanda su stdin, {carta, visitate, qui, zone}; una riga JSON per
//  risposta su stdout: {foglio, conflitti} (conflitti: ciò che si tocca o sporge,
//  vuoto se tutto sta al suo posto). Con {carta, zone, disposizione: true} risponde
//  con la disposizione intera (posti, tracciati, lati, storture); con
//  {carta, zone, terreno: true}, con la stampa (src/gioco/terreno.ts): dove cade
//  ogni luogo, che cosa tagliano il torrente, l'emissario e la ferrovia. Il
//  processo resta aperto per tutta la prova.
//  Uso: node app/scripts/foglio-node.mjs   (serve `npm ci --prefix app`)
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
// foglio.ts e terreno.ts (che di foglio.ts importa soltanto i tipi)
const trascrivi = (nome) => ts.transpileModule(fs.readFileSync(path.join(qui, "..", "src", "gioco", `${nome}.ts`), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "foglio-"));
let F, T;
try {
  fs.writeFileSync(path.join(tmp, "foglio.mjs"), trascrivi("foglio"));
  fs.writeFileSync(path.join(tmp, "terreno.mjs"), trascrivi("terreno"));
  F = await import(pathToFileURL(path.join(tmp, "foglio.mjs")).href);
  T = await import(pathToFileURL(path.join(tmp, "terreno.mjs")).href);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

const righe = readline.createInterface({ input: process.stdin });
for await (const riga of righe) {
  if (!riga.trim()) continue;
  const { carta, visitate, qui: luogo, zone, disposizione, terreno } = JSON.parse(riga);
  const zonaDi = zone ? (id) => zone[id] : undefined;
  if (terreno) {
    // la stampa: dove cade ogni luogo (lago, mare, quota), che cosa taglia ogni linea d'acqua o di ferro, quanto dista il mare
    const d = F.disposizione(carta, zonaDi), a = F.ancoreTerreno(d);
    const t0 = performance.now();
    const t = T.terreno(a);
    const ms = performance.now() - t0;
    const luoghi = Object.fromEntries([...d.posti].map(([id, p]) => [id, {
      lago: T.nelLago(t, p.cx, p.cy), mare: T.nelMare(p.cx, p.cy), quota: Math.round(T.quotaIn(t, p.cx, p.cy)), costa: Math.round(T.rivaX(p.cy) - p.cx),
    }]));
    const taglia = (linea) => [...d.tracciati.values()].filter((tr) => T.taglia(linea, tr.campioni)).map((tr) => `${tr.a}|${tr.b}`);
    const costaStrade = Math.min(...[...d.tracciati.values()].flatMap((tr) => tr.campioni.map((q) => T.rivaX(q.cy) - q.cx)));
    process.stdout.write(JSON.stringify({ ms, luoghi, costaStrade, fiume: taglia(t.fiume), emissario: taglia(t.emissario), ferrovia: t.ferrovia ? taglia(t.ferrovia) : [],
      ancore: a }) + "\n");
    continue;
  }
  if (disposizione) {
    // la disposizione intera: dove sta ogni luogo, i tracciati coi loro campioni, i lati dei nomi, ciò che resta storto
    const t0 = performance.now();
    const d = F.disposizione(carta, zonaDi);
    const ms = performance.now() - t0;
    const mappa = (m) => Object.fromEntries(m);
    process.stdout.write(JSON.stringify({
      posti: mappa(d.posti), piegata: mappa(F.grigliaPiegata(carta, zonaDi)), k: mappa(d.k), ritiri: d.ritiri, griglia: d.griglia, storture: d.storture, ms,
      tracciati: [...d.tracciati.values()].map((t) => ({ a: t.a, b: t.b, classe: t.classe, scala: t.scala, campioni: t.campioni, d: t.d })),
      lati: { tappe: mappa(d.lati.tappe), luoghi: mappa(d.lati.luoghi), qui: mappa(d.lati.qui) },
      costanti: { FOGLIO: F.FOGLIO, IRREGOLARE: F.IRREGOLARE, RAGGIO: F.RAGGIO, RAGGIO_QUI: F.RAGGIO_QUI, RAGGIO_TAPPA: F.RAGGIO_TAPPA },
    }) + "\n");
    continue;
  }
  const f = F.foglio(carta, visitate, luogo ?? null, zonaDi);
  process.stdout.write(JSON.stringify({ foglio: f, conflitti: F.conflitti(f), costanti: { FOGLIO: F.FOGLIO } }) + "\n");
}
