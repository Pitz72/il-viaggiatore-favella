// ====================================================================
//  src/gioco/parti.ts (con testo.ts) dentro Node, per i collaudi.
// --------------------------------------------------------------------
//  Legge da stdin {testi: [testo stampato dal motore…], scelte: [opzione…]} e
//  scrive, per ogni testo, le righe del diario con le parti ritrovate e i pezzi
//  senza parte; per ogni scelta, lo stesso. La tabella dei testi è quella vera
//  del gioco: public/voce/indice.json. Serve a collaudo/doppiaggio.py.
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "parti-"));
const moduli = {};
try {
  for (const nome of ["testo", "parti"]) {
    const sorgente = fs.readFileSync(path.join(qui, "..", "src", "gioco", `${nome}.ts`), "utf8");
    const js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
    fs.writeFileSync(path.join(tmp, `${nome}.mjs`), js.replace(/from "\.\/testo"/g, 'from "./testo.mjs"'));
  }
  for (const nome of ["testo", "parti"]) moduli[nome] = await import(pathToFileURL(path.join(tmp, `${nome}.mjs`)).href);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
const { analizza } = moduli.testo;
const { tabella, partiDelBlocco, partiDellaScelta } = moduli.parti;

const indice = JSON.parse(fs.readFileSync(path.join(qui, "..", "public", "voce", "indice.json"), "utf8"));
const tab = tabella(indice.testi);
const input = JSON.parse(fs.readFileSync(0, "utf8"));
process.stdout.write(JSON.stringify({
  testi: input.testi.map((t) => analizza(t).map((b) => ({ blocco: b, ...partiDelBlocco(b, tab) }))),
  scelte: input.scelte.map((o) => partiDellaScelta(o, tab)),
}));
