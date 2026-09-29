// ====================================================================
//  Fa girare la logica delle conferme (src/gioco/azioni.ts) fuori dal browser.
// --------------------------------------------------------------------
//  Serve al collaudo (collaudo/conferme.py): legge da stdin un elenco di
//  {cmd, anteprima, mondo} e scrive per ciascuno la Conferma che
//  valutaConferma ne ricava (o null). azioni.ts non ha React né import di
//  runtime: basta trascriverlo da TypeScript a JavaScript.
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const sorgente = fs.readFileSync(path.join(qui, "..", "src", "gioco", "azioni.ts"), "utf8");
const js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "azioni-"));
const file = path.join(tmp, "azioni.mjs");
fs.writeFileSync(file, js);
const azioni = await import(pathToFileURL(file).href);

const input = JSON.parse(fs.readFileSync(0, "utf8"));
const uscita = input.map(({ cmd, anteprima, mondo }) => ({
  cmd,
  serve: azioni.serveAnteprima(cmd, mondo),
  conferma: azioni.valutaConferma(cmd, anteprima, mondo),
}));
process.stdout.write(JSON.stringify(uscita));
fs.rmSync(tmp, { recursive: true, force: true });
