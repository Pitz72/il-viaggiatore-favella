// ====================================================================
//  Le regole dei trofei (src/gioco/trofei.ts) dentro Node, per i collaudi.
// --------------------------------------------------------------------
//  Serve a collaudo/trofei.py: le partite le gioca il ponte vero in Python,
//  i trofei li decide questa logica, la stessa del gioco. Una riga JSON per
//  partita su stdin, {turni: [Turno…], vinti: [id…]}; una riga JSON per
//  risposta su stdout: per ogni turno, i trofei che fa vincere (i già vinti
//  si accumulano lungo la partita). Una riga {catalogo: true} chiede il
//  catalogo e le tabelle (finali, fini, gesti).
//  Uso: node app/scripts/trofei-node.mjs   (serve `npm ci --prefix app`)
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const sorgente = fs.readFileSync(path.join(qui, "..", "src", "gioco", "trofei.ts"), "utf8");
const js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "trofei-"));
const file = path.join(tmp, "trofei.mjs");
fs.writeFileSync(file, js);
let T;
try {
  T = await import(pathToFileURL(file).href);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

const righe = readline.createInterface({ input: process.stdin });
for await (const riga of righe) {
  if (!riga.trim()) continue;
  const domanda = JSON.parse(riga);
  if (domanda.catalogo) {
    process.stdout.write(JSON.stringify({ trofei: T.TROFEI, famiglie: T.FAMIGLIE, finali: T.FINALI, fini: T.FINI, gesti: T.GESTI_TROFEI, solo_in: T.SOLO_IN }) + "\n");
    continue;
  }
  const vinti = new Set(domanda.vinti ?? []);
  const out = domanda.turni.map((t) => {
    const nuovi = T.trofeiDelTurno(t, vinti);
    for (const id of nuovi) vinti.add(id);
    return nuovi;
  });
  process.stdout.write(JSON.stringify(out) + "\n");
}
