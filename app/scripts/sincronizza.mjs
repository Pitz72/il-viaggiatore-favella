// ====================================================================
//  Copia motore e avventura dentro public/ prima di ogni dev/build.
// --------------------------------------------------------------------
//  Fonti di verità (mai modificare le copie in public/favella-engine):
//    ../motore/*.py      → public/favella-engine/engine/*.fav
//    ../prototipo/*.fav  → public/favella-engine/galleria/il-viaggiatore/
//    node_modules/pyodide (nucleo) + vendor/lark-*.whl → public/pyodide/
//  Pyodide e Lark sono dentro il progetto: il gioco non scarica niente da
//  internet (serve alla versione desktop, e rende offline anche quella web).
//  I moduli Python si servono come «.fav»: molti hosting rifiutano o provano
//  a eseguire i .py. Il runtime li riscrive col nome vero dentro Pyodide.
// ====================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const qui = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(qui, "..");
const radice = path.resolve(app, "..");

const MODULI = ["favella_utils", "strutture", "libreria_azioni", "compilatore", "gioco"];
const destMotore = path.join(app, "public", "favella-engine", "engine");
const destGioco = path.join(app, "public", "favella-engine", "galleria", "il-viaggiatore");

fs.rmSync(path.join(app, "public", "favella-engine"), { recursive: true, force: true });
fs.mkdirSync(destMotore, { recursive: true });
fs.mkdirSync(destGioco, { recursive: true });

for (const m of MODULI) {
  fs.copyFileSync(path.join(radice, "motore", `${m}.py`), path.join(destMotore, `${m}.fav`));
}
const fav = fs.readdirSync(path.join(radice, "prototipo")).filter((f) => f.endsWith(".fav"));
for (const f of fav) fs.copyFileSync(path.join(radice, "prototipo", f), path.join(destGioco, f));

// Pyodide: solo il nucleo (interprete + libreria standard + lockfile).
const PYODIDE = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
const destPy = path.join(app, "public", "pyodide");
fs.rmSync(destPy, { recursive: true, force: true });
fs.mkdirSync(destPy, { recursive: true });
for (const f of PYODIDE) fs.copyFileSync(path.join(app, "node_modules", "pyodide", f), path.join(destPy, f));
const ruote = fs.readdirSync(path.join(app, "vendor")).filter((f) => f.endsWith(".whl"));
for (const f of ruote) fs.copyFileSync(path.join(app, "vendor", f), path.join(destPy, f));
const verPy = JSON.parse(fs.readFileSync(path.join(app, "node_modules", "pyodide", "package.json"), "utf8")).version;

const versione = /VERSIONE_MOTORE\s*=\s*"([^"]+)"/.exec(
  fs.readFileSync(path.join(radice, "motore", "strutture.py"), "utf8"))?.[1];
console.log(`[sincronizza] motore FAVELLA ${versione} (${MODULI.length} moduli) + ${fav.length} file dell'avventura + Pyodide ${verPy} + ${ruote.join(", ")}`);
