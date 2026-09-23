// ====================================================================
//  Aggiornamento automatico (electron-updater, release di GitHub).
// --------------------------------------------------------------------
//  All'avvio il gioco chiede alle release di Pitz72/il-viaggiatore-favella
//  se c'è una versione più nuova (file latest.yml / latest-linux.yml che il
//  workflow «Rilascio» allega). Se c'è, la scarica in silenzio e avvisa la
//  pagina: l'installazione avviene alla chiusura, o subito col pulsante
//  «riavvia» dell'avviso.
//
//  Vale per l'installer Windows (NSIS) e per l'AppImage Linux. La versione
//  portatile e il pacchetto .deb non si aggiornano da soli: per loro si
//  scarica la nuova release a mano (il .deb lo aggiorna il sistema).
//  Le pre-release (alpha, beta, rc) le riceve solo chi ne sta già usando una.
// ====================================================================
const { app, ipcMain } = require("electron");
const registro = require("./registro.cjs");

function supportato() {
  if (!app.isPackaged) return "versione di sviluppo";
  if (process.env.PORTABLE_EXECUTABLE_DIR) return "versione portatile";
  if (process.platform === "linux" && !process.env.APPIMAGE) return "pacchetto di sistema (.deb)";
  if (!["win32", "linux"].includes(process.platform)) return "sistema non supportato";
  return null;
}

function avvia(finestra) {
  let stato = { stato: "fermo" };
  const invia = (s) => {
    stato = s;
    const w = finestra();
    if (w && !w.isDestroyed()) w.webContents.send("aggiornamento", s);
  };
  ipcMain.handle("aggiornamento:stato", () => stato);

  const motivo = supportato();
  if (motivo) {
    registro.info(`aggiornamento automatico non attivo: ${motivo}`);
    ipcMain.on("aggiornamento:installa", () => {});
    return;
  }

  const { autoUpdater } = require("electron-updater");
  autoUpdater.logger = registro;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = /-/.test(app.getVersion());

  autoUpdater.on("update-available", (i) => { registro.info(`aggiornamento disponibile: ${i.version}`); invia({ stato: "scarico", versione: i.version }); });
  autoUpdater.on("download-progress", (p) => invia({ stato: "scarico", versione: stato.versione, percento: Math.round(p.percent) }));
  autoUpdater.on("update-downloaded", (i) => { registro.info(`aggiornamento pronto: ${i.version}`); invia({ stato: "pronto", versione: i.version }); });
  autoUpdater.on("update-not-available", () => registro.info("nessun aggiornamento"));
  autoUpdater.on("error", (e) => { registro.warn("aggiornamento non riuscito:", e?.message ?? String(e)); invia({ stato: "fermo" }); });

  ipcMain.on("aggiornamento:installa", () => {
    registro.info("installazione dell'aggiornamento su richiesta");
    autoUpdater.quitAndInstall(false, true);
  });

  // qualche secondo dopo l'avvio: prima conta far partire il gioco
  setTimeout(() => autoUpdater.checkForUpdates().catch((e) => registro.warn("controllo aggiornamenti:", e?.message ?? String(e))), 8000);
}

module.exports = { avvia };
