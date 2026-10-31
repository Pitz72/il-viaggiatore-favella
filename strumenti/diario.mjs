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
//    node strumenti/diario.mjs registro [file]   (sviluppo/REGISTRO.md in ordine: la usa la CI)
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

// ── il registro dei materiali ────────────────────────────────────────────────
//  sviluppo/REGISTRO.md dice dove sta ogni cosa e che copie ha (regola assoluta di CLAUDE.md). Qui non si giudica che cosa c'è
//  scritto, solo che il file sia in ordine: ID unici e senza buchi, stati ammessi, date vere e in ordine, ID citati che esistono,
//  link che portano a un file, niente segreti. Così una riga sbagliata si vede nella CI.
const REGISTRO = path.join(radice, "sviluppo", "REGISTRO.md");
const STATI = ["nel repository", "fuori da git", "solo backup", "perso"];
const PROIBITI = /_SEGRETI|ACCESSI\.md|password|passwd|\bghp_\w{10,}|\bsk-[A-Za-z0-9]{10,}|\bAKIA[0-9A-Z]{12,}/i;
const dataVera = (s) => { const d = new Date(`${s}T00:00:00Z`); return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s); };
const idDi = (k) => `M${String(k).padStart(2, "0")}`;

// le righe di una tabella sotto «## titolo…», senza intestazione e filetto, ognuna col suo numero di riga
function tabella(righe, titolo) {
  const da = righe.findIndex((r) => r.startsWith("## ") && r.slice(3).startsWith(titolo));
  if (da < 0) return null;
  const celle = [];
  for (let i = da + 1; i < righe.length && !righe[i].startsWith("## "); i++) {
    if (righe[i].startsWith("|")) celle.push({ n: i + 1, c: righe[i].replace(/^\|\s*|\s*\|\s*$/g, "").split(/\s*\|\s*/) });
  }
  return celle.slice(2);
}

function verificaRegistro(file) {
  const errori = [];
  const nome = path.relative(radice, file).replace(/\\/g, "/");
  const e = (n, msg) => errori.push(`${nome}${n ? `:${n}` : ""}: ${msg}`);
  if (!fs.existsSync(file)) return { errori: [`${nome}: il file non c'è`], materiali: 0, movimenti: 0 };
  const righe = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").split("\n");
  const materiali = tabella(righe, "Dove sta cosa");
  const movimenti = tabella(righe, "Registro dei movimenti");
  if (!materiali) e(0, "manca la sezione «Dove sta cosa»");
  if (!movimenti) e(0, "manca la sezione «Registro dei movimenti»");

  const id = new Set();
  for (const { n, c } of materiali ?? []) {
    if (c.length !== 6) { e(n, `${c.length} colonne invece di 6 (ID, Cosa, Dove sta, Copie e backup, Stato, Ultima verifica)`); continue; }
    if (c.some((x) => !x)) e(n, "una cella è vuota (se non c'è nulla da dire, «—»)");
    if (!/^M\d{2,}$/.test(c[0])) e(n, `ID «${c[0]}» non è del tipo M01`);
    else if (id.has(c[0])) e(n, `ID ${c[0]} ripetuto: gli ID non si riusano`);
    else id.add(c[0]);
    if (!STATI.includes(c[4])) e(n, `stato «${c[4]}» non ammesso (${STATI.join(", ")})`);
  }
  for (let k = 1; k <= Math.max(0, ...[...id].map((x) => Number(x.slice(1)))); k++) {
    if (!id.has(idDi(k))) e(0, `manca ${idDi(k)}: le righe dei materiali non si cancellano e gli ID sono consecutivi`);
  }

  let prima = "";
  for (const { n, c } of movimenti ?? []) {
    if (c.length !== 6) { e(n, `${c.length} colonne invece di 6 (Data, ID, Che cosa è successo, Da → a, Verifica, Diario)`); continue; }
    if (c.some((x) => !x)) e(n, "una cella è vuota (se non c'è nulla da dire, «—»)");
    const d = /^(\d{4}-\d{2}-\d{2})(?: → (\d{4}-\d{2}-\d{2}))?$/.exec(c[0]);
    if (!d || !dataVera(d[1]) || (d[2] && (!dataVera(d[2]) || d[2] < d[1]))) {
      e(n, `data «${c[0]}» non è AAAA-MM-GG (né «AAAA-MM-GG → AAAA-MM-GG» quando il giorno non si sa)`);
    } else {
      if (prima && d[1] > prima) e(n, `la data ${d[1]} viene dopo quella della riga sopra (${prima}): il registro va dal più recente`);
      prima = d[1];
    }
    if (c[1] === "—") continue;
    for (const voce of c[1].split(/,\s*/)) {
      const m = /^M(\d+)(?:[–-]M(\d+))?$/.exec(voce);
      if (!m) { e(n, `ID «${voce}» non è Mnn, Mnn–Mmm né «—»`); continue; }
      const da = Number(m[1]); const a = Number(m[2] ?? m[1]);
      if (a < da) e(n, `l'intervallo «${voce}» è al contrario`);
      for (let k = da; k <= a; k++) if (!id.has(idDi(k))) { e(n, `cita ${idDi(k)}, che nella tabella dei materiali non c'è`); break; }
    }
  }

  righe.forEach((r, i) => {
    for (const m of r.matchAll(/\]\(([^)\s]+)\)/g)) {
      const t = m[1].split("#")[0];
      if (!t || /^[a-z][a-z0-9+.-]*:/i.test(t)) continue;
      let p = t;
      try { p = decodeURI(t); } catch { /* resta com'è */ }
      if (!fs.existsSync(path.resolve(path.dirname(file), p))) e(i + 1, `il link «${t}» non porta a nessun file`);
    }
    const x = PROIBITI.exec(r);
    if (x) e(i + 1, `contiene «${x[0]}»: nel registro niente segreti né percorsi di credenziali (il repository è pubblico)`);
  });
  return { errori, materiali: id.size, movimenti: (movimenti ?? []).length };
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
} else if (comando === "registro") {
  const { errori, materiali, movimenti } = verificaRegistro(arg[0] ? path.resolve(arg[0]) : REGISTRO);
  for (const x of errori) console.error(`registro non valido: ${x}`);
  console.log(`Registro: ${materiali} materiali, ${movimenti} movimenti${errori.length ? `, ${errori.length} errori` : ""}.`);
  process.exit(errori.length ? 1 : 0);
} else {
  console.error("Uso: nuovo \"Titolo\" [--tipo …] | indice | verifica | registro [file]");
  process.exit(1);
}
