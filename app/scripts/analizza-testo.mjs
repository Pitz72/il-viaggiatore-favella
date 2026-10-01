// ====================================================================
//  src/gioco/testo.ts dentro Node, per i collaudi.
// --------------------------------------------------------------------
//  Legge da stdin un elenco JSON di testi e scrive, per ciascuno, i blocchi che
//  `analizza` ne ricava; in più l'elenco dei personaggi che l'interfaccia conosce.
//  Serve a collaudo/testo.py: le risposte del motore stanno nello stile di
//  sistema, la prosa della storia no, e ogni personaggio parla come tale.
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const sorgente = fs.readFileSync(path.join(qui, "..", "src", "gioco", "testo.ts"), "utf8");
const js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "testo-"));
const file = path.join(tmp, "testo.mjs");
fs.writeFileSync(file, js);
let testo;
try { testo = await import(pathToFileURL(file).href); } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

const input = JSON.parse(fs.readFileSync(0, "utf8"));
process.stdout.write(JSON.stringify({
  personaggi: testo.PERSONAGGI,
  voci: testo.VOCI,
  blocchi: input.map((t) => testo.analizza(t)),
}));
