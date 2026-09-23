// ====================================================================
//  Salvataggi su disco (versione desktop).
// --------------------------------------------------------------------
//  Un file per posto in Documenti/Il Viaggiatore/Salvataggi:
//    automatico.viaggiatore, posto-1.viaggiatore … posto-6.viaggiatore
//  JSON leggibile (formato in app/src/lib/salvataggi.ts). Scrittura atomica:
//  si scrive un .tmp e lo si rinomina, e la versione precedente resta come
//  .bak: un'interruzione a metà non distrugge mai un salvataggio buono.
//  La pagina non tocca il disco: chiede tutto qui, per nome di posto.
// ====================================================================
const { app, ipcMain, dialog, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const registro = require("./registro.cjs");

const POSTI = ["auto", "1", "2", "3", "4", "5", "6"];
const ESTENSIONE = ".viaggiatore";
const LIMITE_IMPORT = 8 * 1024 * 1024;

// VIAGGIATORE_SALVATAGGI sposta la cartella (collaudi, CI): mai nei Documenti di chi prova
const cartella = () => process.env.VIAGGIATORE_SALVATAGGI || path.join(app.getPath("documents"), "Il Viaggiatore", "Salvataggi");
const nomeFile = (posto) => (posto === "auto" ? "automatico" : `posto-${posto}`) + ESTENSIONE;

function controllaPosto(posto) {
  if (!POSTI.includes(posto)) throw new Error(`Posto di salvataggio sconosciuto: ${posto}`);
  return path.join(cartella(), nomeFile(posto));
}

async function scriviAtomico(file, testo) {
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.promises.writeFile(tmp, testo, "utf8");
  try { await fs.promises.copyFile(file, `${file}.bak`); } catch { /* primo salvataggio */ }
  await fs.promises.rename(tmp, file);
}

function registra(finestra) {
  ipcMain.handle("salvataggi:elenco", async () => {
    const out = [];
    for (const posto of POSTI) {
      const file = path.join(cartella(), nomeFile(posto));
      try { out.push({ posto, testo: await fs.promises.readFile(file, "utf8") }); }
      catch (e) { out.push({ posto, testo: null, errore: e.code === "ENOENT" ? undefined : String(e.message) }); }
    }
    return out;
  });

  ipcMain.handle("salvataggi:scrivi", async (_e, posto, testo) => {
    const file = controllaPosto(posto);
    if (typeof testo !== "string" || testo.length > LIMITE_IMPORT) throw new Error("Salvataggio non valido.");
    await scriviAtomico(file, testo);
    registro.info(`salvataggio scritto: ${path.basename(file)} (${testo.length} byte)`);
  });

  ipcMain.handle("salvataggi:elimina", async (_e, posto) => {
    const file = controllaPosto(posto);
    await fs.promises.rm(file, { force: true });
    registro.info(`salvataggio eliminato: ${path.basename(file)}`);
  });

  ipcMain.handle("salvataggi:esporta", async (_e, posto, suggerito) => {
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

  ipcMain.handle("salvataggi:importa", async () => {
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

  ipcMain.handle("salvataggi:cartella", () => cartella());
  ipcMain.handle("salvataggi:apri-cartella", async () => {
    await fs.promises.mkdir(cartella(), { recursive: true });
    await shell.openPath(cartella());
  });
}

module.exports = { registra, cartella };
