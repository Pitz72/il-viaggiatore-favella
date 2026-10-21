// ====================================================================
//  La colonna sonora da scaricare (menu d'avvio → Extra).
// --------------------------------------------------------------------
//  I sette brani di The Runtimers viaggiano col gioco (desktop/web/colonna-sonora,
//  scritti da strumenti/colonna-sonora.py, l'elenco in album.json). «Scarica la
//  colonna sonora ufficiale» chiede dove metterla, ci crea la cartella
//  «Il Viaggiatore - Official Soundtrack» con gli MP3, la copertina e il
//  LEGGIMI, e la apre in Esplora risorse. La pagina non sceglie né percorsi né
//  file: chiede soltanto, e la copia la fa qui, dall'elenco.
// ====================================================================
const { app, dialog, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const registro = require("./registro.cjs");
const { gestisci } = require("./ipc.cjs");

const CARTELLA_ALBUM = "Il Viaggiatore - Official Soundtrack";
// solo nomi di file semplici, dentro la cartella dell'album: niente percorsi da album.json
const NOME_BUONO = /^[^\\/:*?"<>|]+\.(mp3|jpg|txt)$/;

/** Copia l'album in <dove>/<CARTELLA_ALBUM> e restituisce quella cartella. Separata dall'IPC, per le prove. */
async function copiaAlbum(web, dove) {
  const da = path.join(web, "colonna-sonora");
  const album = JSON.parse(await fs.promises.readFile(path.join(da, "album.json"), "utf8"));
  const file = Array.isArray(album.file) ? album.file : [];
  if (!file.length || file.some((f) => typeof f !== "string" || !NOME_BUONO.test(f))) throw new Error("L'elenco della colonna sonora è guasto.");
  const a = path.join(dove, CARTELLA_ALBUM);
  await fs.promises.mkdir(a, { recursive: true });
  for (const f of file) await fs.promises.copyFile(path.join(da, f), path.join(a, f));
  return a;
}

function registra(web, finestra) {
  gestisci("colonna:salva", async () => {
    const scelta = await dialog.showOpenDialog(finestra(), {
      title: "Dove salvare la colonna sonora",
      defaultPath: app.getPath("music"),
      buttonLabel: "Salva qui",
      properties: ["openDirectory", "createDirectory"],
    });
    if (scelta.canceled || !scelta.filePaths[0]) return null;
    const cartella = await copiaAlbum(web, scelta.filePaths[0]);
    registro.info(`colonna sonora salvata in ${cartella}`);
    shell.openPath(cartella).catch(() => {});
    return cartella;
  });
}

module.exports = { registra, copiaAlbum, CARTELLA_ALBUM };
