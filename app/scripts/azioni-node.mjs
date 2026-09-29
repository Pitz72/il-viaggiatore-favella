// ====================================================================
//  src/gioco/azioni.ts dentro Node, per i collaudi.
// --------------------------------------------------------------------
//  azioni.ts non ha React né import di runtime (solo tipi): basta
//  trascriverlo da TypeScript a JavaScript e importarlo. Così i collaudi
//  Python provano la logica vera dell'interfaccia, non una sua copia.
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

export async function caricaAzioni() {
  const qui = path.dirname(fileURLToPath(import.meta.url));
  const sorgente = fs.readFileSync(path.join(qui, "..", "src", "gioco", "azioni.ts"), "utf8");
  const js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "azioni-"));
  const file = path.join(tmp, "azioni.mjs");
  fs.writeFileSync(file, js);
  try {
    return await import(pathToFileURL(file).href);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
