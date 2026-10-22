// ====================================================================
//  Il foglio della mappa (src/gioco/foglio.ts) dentro Node, per i collaudi.
// --------------------------------------------------------------------
//  Serve a collaudo/mappa.py: il ponte vero dà la carta e i luoghi visitati,
//  questa logica, la stessa del gioco, dice che cosa va sul foglio e dove. Una
//  riga JSON per domanda su stdin, {carta, visitate, qui, zone}; una riga JSON per
//  risposta su stdout: {foglio, conflitti} (conflitti: ciò che si tocca o sporge,
//  vuoto se tutto sta al suo posto). Il processo resta aperto per tutta la prova.
//  Uso: node app/scripts/foglio-node.mjs   (serve `npm ci --prefix app`)
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const sorgente = fs.readFileSync(path.join(qui, "..", "src", "gioco", "foglio.ts"), "utf8");
const js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "foglio-"));
const file = path.join(tmp, "foglio.mjs");
fs.writeFileSync(file, js);
let F;
try {
  F = await import(pathToFileURL(file).href);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

const righe = readline.createInterface({ input: process.stdin });
for await (const riga of righe) {
  if (!riga.trim()) continue;
  const { carta, visitate, qui: luogo, zone } = JSON.parse(riga);
  const f = F.foglio(carta, visitate, luogo ?? null, zone ? (id) => zone[id] : undefined);
  process.stdout.write(JSON.stringify({ foglio: f, conflitti: F.conflitti(f), costanti: { FOGLIO: F.FOGLIO } }) + "\n");
}
