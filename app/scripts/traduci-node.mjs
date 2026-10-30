// ====================================================================
//  src/gioco/traduci.ts (con testo.ts) dentro Node, per i collaudi.
// --------------------------------------------------------------------
//  Legge da stdin {testi: [testo stampato dal motore…], scelte: [risposta…],
//  nomi: [nome…]} e scrive, per ogni testo, i blocchi del diario con la loro
//  traduzione (null se non si ritrova); per ogni risposta e ogni nome, lo
//  stesso. I cataloghi sono quelli veri del gioco (src/lingue/en/).
//  Con `passi: [{testo, dir, verso}…]` dice, per ogni spostamento, se nel testo
//  inglese del luogo (quello di «look») c'è una parola da toccare che porta a
//  quell'uscita: il trofeo «Parola per parola» si vince solo se sì.
//  Serve a collaudo/traduzione.py.
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const qui = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(qui, "..", "src");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "traduci-"));
const moduli = {};
try {
  for (const nome of ["testo", "traduci"]) {
    const sorgente = fs.readFileSync(path.join(src, "gioco", `${nome}.ts`), "utf8");
    let js = ts.transpileModule(sorgente, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
    // i cataloghi: dal loro posto vero, come JSON
    js = js.replace(/from "\.\.\/lingue\/en\/([\w-]+)\.json";/g, (_, f) =>
      `from ${JSON.stringify(pathToFileURL(path.join(src, "lingue", "en", `${f}.json`)).href)} with { type: "json" };`);
    js = js.replace(/from "\.\/testo"/g, 'from "./testo.mjs"');
    fs.writeFileSync(path.join(tmp, `${nome}.mjs`), js);
  }
  for (const nome of ["testo", "traduci"]) moduli[nome] = await import(pathToFileURL(path.join(tmp, `${nome}.mjs`)).href);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
const { analizza, spezza, GESTI, VOCI } = moduli.testo;
// come azioni.ts: «La piazza» → «piazza»; e le parole da toccare del testo italiano, com'è (per confrontarlo con l'inglese)
const senzaArticolo = (s) => s.replace(/^(il|lo|la|i|gli|le|un|uno|una)\s+/i, "").replace(/^(l'|un')/i, "").toLowerCase();
const nominaInItaliano = (testo, dir, verso) => {
  const parole = analizza(testo).filter((b) => b.tipo === "prosa").flatMap((b) => spezza(b.testo).filter((p) => p.k === "chiave").map((p) => p.s.toLowerCase()));
  return parole.includes(dir) || parole.includes(senzaArticolo(verso));
};
const { traduciTesto, traduciBlocco, nome, paroleDaToccare, nominaLaStrada, GESTI_EN, VOCI_EN } = moduli.traduci;

const input = JSON.parse(fs.readFileSync(0, "utf8"));
process.stdout.write(JSON.stringify({
  testi: (input.testi ?? []).map((t) => analizza(t).map((b) => {
    const testo = b.tipo === "stanza" ? b.titolo : b.testo;
    const en = b.tipo === "stanza" ? (nome(testo) !== testo ? nome(testo) : null) : b.tipo === "comando" ? testo : traduciTesto(testo);
    return { blocco: b, en, mostrato: traduciBlocco(b) };
  })),
  scelte: (input.scelte ?? []).map((o) => ({ it: o, en: traduciTesto(o) })),
  nomi: (input.nomi ?? []).map((n) => ({ it: n, en: nome(n) !== n ? nome(n) : null })),
  passi: (input.passi ?? []).map((x) => ({ en: nominaLaStrada(x.testo, x.dir, x.verso ?? ""), it: nominaInItaliano(x.testo, x.dir, x.verso ?? ""),
    parole: paroleDaToccare(x.testo) })),
  // le righe a lato dello schermo: le chiavi delle tabelle italiane e di quelle inglesi
  lato: { gesti: [Object.keys(GESTI).sort(), Object.keys(GESTI_EN).sort()], voci: [Object.keys(VOCI).sort(), Object.keys(VOCI_EN).sort()] },
}));
