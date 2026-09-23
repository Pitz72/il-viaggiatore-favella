// ====================================================================
//  Il Viaggiatore — diario di sviluppo.
// --------------------------------------------------------------------
//  Una voce per ogni sessione di lavoro, decisione o problema, in
//  sviluppo/diario/AAAA-MM-GG-titolo.md, con un modello fisso: contesto,
//  lavoro fatto, decisioni (col perché), verifiche, questioni aperte.
//  L'indice sviluppo/DIARIO.md si rigenera dalle voci.
//
//  Il CHANGELOG dice COSA è cambiato fra due versioni; il diario dice COME
//  e PERCHÉ ci si è arrivati. Le due cose non si ripetono.
//
//    node strumenti/diario.mjs nuovo "Titolo" [--tipo sessione|decisione|problema]
//    node strumenti/diario.mjs indice
//    node strumenti/diario.mjs verifica      (voci ben formate: la usa la CI)
// ====================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARTELLA = path.join(radice, "sviluppo", "diario");
const INDICE = path.join(radice, "sviluppo", "DIARIO.md");
const TIPI = ["sessione", "decisione", "problema"];
const CAMPI = ["data", "titolo", "tipo", "versione"];

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function leggiVoce(file) {
  const testo = fs.readFileSync(path.join(CARTELLA, file), "utf8").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n/.exec(testo);
  if (!m) return { file, errore: "manca l'intestazione --- … ---" };
  const meta = {};
  for (const riga of m[1].split("\n")) {
    const k = /^(\w+):\s*(.*)$/.exec(riga);
    if (k) meta[k[1]] = k[2].replace(/^"(.*)"$/, "$1");
  }
  const mancanti = CAMPI.filter((c) => !meta[c]);
  if (mancanti.length) return { file, errore: `mancano: ${mancanti.join(", ")}` };
  if (!TIPI.includes(meta.tipo)) return { file, errore: `tipo «${meta.tipo}» non ammesso (${TIPI.join(", ")})` };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.data)) return { file, errore: `data «${meta.data}» non è AAAA-MM-GG` };
  if (meta.ora && !/^\d{2}:\d{2}$/.test(meta.ora)) return { file, errore: `ora «${meta.ora}» non è HH:MM` };
  const sintesi = /## In breve\n+([^\n]+)/.exec(testo)?.[1] ?? "";
  return { file, ...meta, sintesi };
}

const voci = () => (fs.existsSync(CARTELLA) ? fs.readdirSync(CARTELLA) : [])
  .filter((f) => f.endsWith(".md")).sort().map(leggiVoce);

function scriviIndice() {
  const tutte = voci();
  const chiave = (v) => `${v.data} ${v.ora ?? "00:00"} ${v.file}`;
  const buone = tutte.filter((v) => !v.errore).sort((a, b) => chiave(b).localeCompare(chiave(a)));
  const righe = [
    "# Diario di sviluppo",
    "",
    "Come e perché il gioco è arrivato fin qui: una voce per sessione di lavoro,",
    "decisione o problema. Il *cosa* fra due versioni sta in `CHANGELOG.md`; le",
    "regole delle versioni in `sviluppo/VERSIONI.md`.",
    "",
    "Nuova voce: `node strumenti/diario.mjs nuovo \"Titolo\" --tipo sessione`.",
    "Questo indice si rigenera da sé (`node strumenti/diario.mjs indice`).",
    "",
    "| Data | Tipo | Versione | Voce |",
    "|---|---|---|---|",
    ...buone.map((v) => `| ${v.data} | ${v.tipo} | ${v.versione} | [${v.titolo}](diario/${v.file})${v.sintesi ? ` — ${v.sintesi}` : ""} |`),
    "",
  ];
  fs.writeFileSync(INDICE, righe.join("\n"));
  return { buone: buone.length, errate: tutte.filter((v) => v.errore) };
}

const [comando, ...arg] = process.argv.slice(2);
const opzione = (n) => { const i = arg.indexOf(n); return i >= 0 ? arg[i + 1] : undefined; };

if (comando === "nuovo") {
  const titolo = arg.find((a, i) => !a.startsWith("--") && arg[i - 1] !== "--tipo");
  if (!titolo) { console.error('Serve un titolo: node strumenti/diario.mjs nuovo "Titolo"'); process.exit(1); }
  const tipo = opzione("--tipo") ?? "sessione";
  if (!TIPI.includes(tipo)) { console.error(`Tipo non ammesso: ${TIPI.join(", ")}`); process.exit(1); }
  const ora = new Date();
  const data = `${ora.getFullYear()}-${String(ora.getMonth() + 1).padStart(2, "0")}-${String(ora.getDate()).padStart(2, "0")}`;
  const hhmm = `${String(ora.getHours()).padStart(2, "0")}:${String(ora.getMinutes()).padStart(2, "0")}`;
  const versione = JSON.parse(fs.readFileSync(path.join(radice, "versione.json"), "utf8")).gioco;
  fs.mkdirSync(CARTELLA, { recursive: true });
  let nome = `${data}-${slug(titolo)}.md`;
  for (let n = 2; fs.existsSync(path.join(CARTELLA, nome)); n++) nome = `${data}-${slug(titolo)}-${n}.md`;
  fs.writeFileSync(path.join(CARTELLA, nome), `---
data: ${data}
ora: "${hhmm}"
titolo: "${titolo.replace(/"/g, "'")}"
tipo: ${tipo}
versione: ${versione}
---

# ${titolo}

## In breve
(Una frase: che cosa è successo e perché conta.)

## Contesto
(Da dove si partiva, che cosa si voleva.)

## Lavoro fatto
-

## Decisioni
- **…** — perché: …

## Verifiche
(Collaudi eseguiti e con quale esito; numeri, non impressioni.)

## Questioni aperte
-
`);
  const { buone } = scriviIndice();
  console.log(`Nuova voce: sviluppo/diario/${nome} (indice: ${buone} voci)`);
} else if (comando === "indice" || comando === "verifica") {
  const { buone, errate } = scriviIndice();
  for (const v of errate) console.error(`voce non valida: ${v.file}: ${v.errore}`);
  console.log(`Diario: ${buone} voci${errate.length ? `, ${errate.length} non valide` : ""}.`);
  process.exit(comando === "verifica" && errate.length ? 1 : 0);
} else {
  console.error("Uso: nuovo \"Titolo\" [--tipo …] | indice | verifica");
  process.exit(1);
}
