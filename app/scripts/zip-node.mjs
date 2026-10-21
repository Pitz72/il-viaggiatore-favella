// ====================================================================
//  src/lib/zip.ts dentro Node, per collaudo/musica.py.
// --------------------------------------------------------------------
//  Uso: node app/scripts/zip-node.mjs <uscita.zip> <file>…
//  Mette i file nello ZIP col loro nome (più una cartella, come fa il gioco) e
//  scrive il risultato: il collaudo lo apre con zipfile e confronta i contenuti.
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const js = ts.transpileModule(fs.readFileSync(path.join(qui, "..", "src", "lib", "zip.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "zip-"));
fs.writeFileSync(path.join(tmp, "zip.mjs"), js);
let Z;
try { Z = await import(pathToFileURL(path.join(tmp, "zip.mjs")).href); } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

const [uscita, ...file] = process.argv.slice(2);
const voci = file.map((f) => ({ nome: `Il Viaggiatore - Official Soundtrack/${path.basename(f)}`, dati: new Uint8Array(fs.readFileSync(f)) }));
fs.writeFileSync(uscita, Z.componiZip(voci));
console.log(`zip: ${voci.length} file`);
