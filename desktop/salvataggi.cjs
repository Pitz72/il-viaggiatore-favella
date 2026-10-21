// ====================================================================
//  Salvataggi su disco (versione desktop).
// --------------------------------------------------------------------
//  Un file per salvataggio in Documenti/Il Viaggiatore/Salvataggi (piano 09, §6):
//    s-AAAAMMGG-HHMMSS-xxxx.viaggiatore   i salvataggi con nome, quanti se ne vuole
//    rapido.viaggiatore                   il rapido (F5 / F9)
//    automatico-1/2/3.viaggiatore         i tre automatici, a rotazione
//  e, letti come gli altri, quelli fino alla 1.25 (automatico, posto-1 … posto-6).
//  Il nome del file è il «posto»; il nome che vede chi gioca sta dentro il file.
//  JSON leggibile (formato in app/src/lib/salvataggi.ts). Scrittura atomica:
//  si scrive un .tmp e lo si rinomina, e la versione precedente resta come
//  .bak: un'interruzione a metà non distrugge mai un salvataggio buono.
//  Più scritture sullo stesso file si mettono in fila (ognuna col suo .tmp). Se il file di un
//  posto è illeggibile, si prova la copia di riserva (.bak).
//  La pagina non tocca il disco: chiede tutto qui, per nome di posto.
//  Qui stanno anche i TROFEI (piano 09, §7): un file solo, trofei.json, nella
//  cartella Il Viaggiatore accanto ai salvataggi, con la stessa scrittura
//  atomica e la stessa riserva (un trofeo non si perde). Che cosa c'è dentro
//  lo decide la pagina (app/src/lib/trofei.ts): qui si legge e si scrive.
// ====================================================================
const { app, dialog, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const registro = require("./registro.cjs");
const { gestisci } = require("./ipc.cjs");

const ESTENSIONE = ".viaggiatore";
const LIMITE_IMPORT = 8 * 1024 * 1024;
const LIMITE_TROFEI = 256 * 1024;
// i nomi di file che il gioco scrive o ha scritto: la pagina non può chiederne altri (lo stesso elenco in app/src/lib/posti.ts)
const POSTO = /^(?:rapido|automatico(?:-[123])?|posto-[1-6]|s-\d{8}-\d{6}-[0-9a-z]{4})$/;

// VIAGGIATORE_SALVATAGGI sposta la cartella (collaudi, CI): mai nei Documenti di chi prova
const cartella = () => process.env.VIAGGIATORE_SALVATAGGI || path.join(app.getPath("documents"), "Il Viaggiatore", "Salvataggi");
const nomeFile = (posto) => posto + ESTENSIONE;
// i trofei accanto alla cartella dei salvataggi; nei collaudi, dentro quella di prova
const fileTrofei = () => (process.env.VIAGGIATORE_SALVATAGGI
  ? path.join(process.env.VIAGGIATORE_SALVATAGGI, "trofei.json")
  : path.join(app.getPath("documents"), "Il Viaggiatore", "trofei.json"));

function controllaPosto(posto) {
  if (typeof posto !== "string" || !POSTO.test(posto)) throw new Error(`Posto di salvataggio sconosciuto: ${posto}`);
  return path.join(cartella(), nomeFile(posto));
}

/** I posti che ci sono nella cartella (i file .viaggiatore col nome di un posto; niente .bak, .tmp o altro). */
async function postiPresenti() {
  let nomi;
  try { nomi = await fs.promises.readdir(cartella()); } catch (e) { if (e.code === "ENOENT") return []; throw e; }
  return nomi.filter((n) => n.endsWith(ESTENSIONE)).map((n) => n.slice(0, -ESTENSIONE.length)).filter((p) => POSTO.test(p)).sort();
}

let progressivo = 0;
async function scriviUnaVolta(file, testo) {
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}-${++progressivo}.tmp`;
  try {
    await fs.promises.writeFile(tmp, testo, "utf8");
    // primo salvataggio (o file tolto): nessuna riserva da tenere, e una vecchia non deve riapparire
    try { await fs.promises.copyFile(file, `${file}.bak`); } catch { await fs.promises.rm(`${file}.bak`, { force: true }); }
    await fs.promises.rename(tmp, file);
  } catch (e) {
    await fs.promises.rm(tmp, { force: true }).catch(() => {});
    throw e;
  }
}

// una coda per file: due salvataggi dello stesso posto non si pestano i piedi, vale l'ultimo richiesto
const code = new Map();
function scriviAtomico(file, testo) {
  const questa = (code.get(file) ?? Promise.resolve()).catch(() => {}).then(() => scriviUnaVolta(file, testo));
  code.set(file, questa);
  questa.catch(() => {}).finally(() => { if (code.get(file) === questa) code.delete(file); });
  return questa;
}

/** Il testo di un posto. File assente: null. File presente ma illeggibile o non JSON: la copia di
 *  riserva, se è buona; se no l'errore. (Una riserva non resuscita un posto eliminato: senza il file
 *  principale non la si guarda.) */
async function leggiPosto(file) {
  const èJson = (t) => { try { const d = JSON.parse(t); return !!d && typeof d === "object"; } catch { return false; } };
  let errore;
  try {
    const testo = await fs.promises.readFile(file, "utf8");
    if (èJson(testo)) return { testo };
    errore = "il file non è leggibile (JSON non valido)";
  } catch (e) {
    if (e.code === "ENOENT") return { testo: null };
    errore = String(e.message);
  }
  try {
    const riserva = await fs.promises.readFile(`${file}.bak`, "utf8");
    if (èJson(riserva)) {
      registro.warn(`salvataggio illeggibile (${path.basename(file)}: ${errore}): ripresa la copia di riserva`);
      return { testo: riserva };
    }
  } catch { /* nessuna riserva */ }
  return { testo: null, errore };
}

function registra(finestra) {
  gestisci("salvataggi:elenco", async () => {
    const out = [];
    for (const posto of await postiPresenti()) {
      out.push({ posto, ...(await leggiPosto(path.join(cartella(), nomeFile(posto)))) });
    }
    return out;
  });

  gestisci("salvataggi:leggi", async (_e, posto) => leggiPosto(controllaPosto(posto)));

  gestisci("salvataggi:scrivi", async (_e, posto, testo) => {
    const file = controllaPosto(posto);
    if (typeof testo !== "string" || testo.length > LIMITE_IMPORT) throw new Error("Salvataggio non valido.");
    await scriviAtomico(file, testo);
    registro.info(`salvataggio scritto: ${path.basename(file)} (${testo.length} byte)`);
  });

  gestisci("salvataggi:elimina", async (_e, posto) => {
    const file = controllaPosto(posto);
    await fs.promises.rm(file, { force: true });
    registro.info(`salvataggio eliminato: ${path.basename(file)}`);
  });

  gestisci("salvataggi:esporta", async (_e, posto, suggerito) => {
    const file = controllaPosto(posto);
    const scelta = await dialog.showSaveDialog(finestra(), {
      title: "Esporta il salvataggio",
      defaultPath: path.join(app.getPath("documents"), String(suggerito || nomeFile(posto)).replace(/[\\/:*?"<>|]/g, "-")),
      filters: [{ name: "Salvataggio del Viaggiatore", extensions: ["viaggiatore"] }],
    });
    if (scelta.canceled || !scelta.filePath) return false;
    await fs.promises.copyFile(file, scelta.filePath);
    registro.info(`salvataggio esportato: ${scelta.filePath}`);
    return true;
  });

  gestisci("salvataggi:importa", async () => {
    const scelta = await dialog.showOpenDialog(finestra(), {
      title: "Apri un salvataggio",
      defaultPath: app.getPath("documents"),
      properties: ["openFile"],
      filters: [{ name: "Salvataggio del Viaggiatore", extensions: ["viaggiatore", "json"] }],
    });
    if (scelta.canceled || !scelta.filePaths[0]) return null;
    const stat = await fs.promises.stat(scelta.filePaths[0]);
    if (stat.size > LIMITE_IMPORT) throw new Error("Il file è troppo grande per essere un salvataggio.");
    registro.info(`salvataggio importato: ${scelta.filePaths[0]}`);
    return fs.promises.readFile(scelta.filePaths[0], "utf8");
  });

  gestisci("trofei:leggi", async () => leggiPosto(fileTrofei()));
  gestisci("trofei:scrivi", async (_e, testo) => {
    if (typeof testo !== "string" || testo.length > LIMITE_TROFEI) throw new Error("Trofei non validi.");
    await scriviAtomico(fileTrofei(), testo);
  });

  gestisci("salvataggi:cartella", () => cartella());
  gestisci("salvataggi:apri-cartella", async () => {
    await fs.promises.mkdir(cartella(), { recursive: true });
    await shell.openPath(cartella());
  });
}

module.exports = { registra, cartella, POSTO };
