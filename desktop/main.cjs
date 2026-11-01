// ====================================================================
//  Il Viaggiatore — versione desktop (Electron), processo principale.
// --------------------------------------------------------------------
//  Una finestra a schermo intero che carica l'app web già costruita
//  (desktop/web, copiata da app/dist) attraverso il protocollo interno
//  app:// : niente server, niente rete. Il motore FAVELLA gira nella pagina
//  con Pyodide, esattamente come nel browser.
//
//  F11 commuta lo schermo intero. Alt+F4 (o «esci» nel menu del gioco) chiude.
//  La finestra nasce dalle impostazioni salvate (impostazioni.cjs): schermo
//  intero o finestra, dove e quanto grande; F11, il trascinamento,
//  l'ingrandimento e la chiusura le aggiornano. Le opzioni della pagina le
//  cambiano dai canali «finestra:*» (piano 09, fase 4).
//  --autoverifica: avvia il gioco senza mostrarlo, gioca qualche comando,
//  salva e ricarica in memoria, e termina con codice 0 (tutto bene) o 1
//  (qualcosa non va). La usa la CI su ogni pacchetto costruito.
//
//  Moduli: servi.cjs (il protocollo app://), registro.cjs (registro tecnico), salvataggi.cjs (file su disco),
//  colonna-sonora.cjs (la colonna sonora da scaricare, menu Extra),
//  aggiornamenti.cjs (aggiornamento automatico dalle release di GitHub),
//  ipc.cjs (i canali con la pagina, e il controllo di chi li chiama),
//  impostazioni.cjs (la finestra e gli aggiornamenti, prima della pagina).
// ====================================================================
const { app, BrowserWindow, protocol, Menu, shell, screen } = require("electron");
const os = require("node:os");
const path = require("node:path");
const registro = require("./registro.cjs");
const lingua = require("./lingua.cjs");
const salvataggi = require("./salvataggi.cjs");
const colonnaSonora = require("./colonna-sonora.cjs");
const aggiornamenti = require("./aggiornamenti.cjs");
const impostazioni = require("./impostazioni.cjs");
const { servitore } = require("./servi.cjs");
const { SCHEMA, ORIGINE, dellApp, su, gestisci } = require("./ipc.cjs");

const WEB = path.join(__dirname, "web");
const AUTOVERIFICA = process.argv.includes("--autoverifica");

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEMA, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true } },
]);

let finestra = null;
// le impostazioni di adesso; l'autoverifica parte sempre da quelle di base e non scrive niente
let imp = { ...impostazioni.BASE };

/** Ricorda com'è la finestra: schermo intero o no, ingrandita o no, e i suoi bordi «normali» (quelli a cui torna). */
function ricorda(subito = false) {
  if (AUTOVERIFICA || !finestra || finestra.isDestroyed()) return;
  const b = finestra.getNormalBounds();
  imp = { ...imp, schermoIntero: finestra.isFullScreen(), massimizzata: finestra.isMaximized(), larghezza: b.width, altezza: b.height, x: b.x, y: b.y };
  impostazioni.scrivi(app.getPath("userData"), imp, subito);
  if (!finestra.webContents.isDestroyed()) finestra.webContents.send("finestra");
}

function creaFinestra() {
  if (!AUTOVERIFICA) imp = impostazioni.leggi(app.getPath("userData"));
  // la finestra deve entrare nello schermo, e stare dove si vede: se no al centro di quello principale
  const area = screen.getPrimaryDisplay().workArea;
  const k = Math.min(1, area.width / imp.larghezza, area.height / imp.altezza);   // se non entra, si rimpicciolisce tutta: resta 16:9
  const larghezza = Math.round(imp.larghezza * k), altezza = Math.round(imp.altezza * k);
  const visibile = impostazioni.posizioneValida(imp.x, imp.y, larghezza, altezza, screen.getAllDisplays().map((d) => d.workArea));
  finestra = new BrowserWindow({
    width: larghezza,
    height: altezza,
    ...(visibile ? { x: imp.x, y: imp.y } : {}),
    minWidth: 960,
    minHeight: 540,
    fullscreen: !AUTOVERIFICA && imp.schermoIntero,
    show: false,
    title: "Il Viaggiatore",
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
      // Sul desktop la musica può partire da sola: non c'è una pagina web da
      // proteggere dall'autoplay, c'è un gioco che si apre col suo trailer.
      autoplayPolicy: "no-user-gesture-required",
    },
  });

  // Solo l'app: niente navigazione altrove, i link esterni vanno nel browser.
  finestra.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  finestra.webContents.on("will-navigate", (e, url) => {
    if (!dellApp(url)) e.preventDefault();
  });

  // gli errori della pagina finiscono nel registro tecnico
  finestra.webContents.on("console-message", (e) => {
    if (e.level === "error" || e.level === "warning") registro.warn(`[pagina] ${e.message} (${e.sourceId}:${e.lineNumber})`);
  });
  finestra.webContents.on("render-process-gone", (_e, d) => registro.error(`processo della pagina terminato: ${d.reason} (${d.exitCode})`));
  finestra.webContents.on("did-fail-load", (_e, codice, descr, url) => registro.error(`caricamento fallito ${codice} ${descr} ${url}`));

  finestra.webContents.on("before-input-event", (e, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      finestra.setFullScreen(!finestra.isFullScreen());
      e.preventDefault();
    }
  });

  // ogni cambio della finestra si ricorda (le scritture ravvicinate se ne fanno una); alla chiusura, subito
  for (const ev of ["resize", "move", "enter-full-screen", "leave-full-screen", "maximize", "unmaximize"]) finestra.on(ev, () => ricorda());
  finestra.on("close", () => ricorda(true));
  if (!AUTOVERIFICA && imp.massimizzata && !imp.schermoIntero) finestra.maximize();

  if (!AUTOVERIFICA) finestra.once("ready-to-show", () => finestra.show());
  finestra.loadURL(`${ORIGINE}/index.html${AUTOVERIFICA ? "?autoverifica" : ""}`);
}

su("versione", (e) => { e.returnValue = app.getVersion(); });
su("registro", (_e, livello, testo) => {
  const scrivi = { info: registro.info, warn: registro.warn, error: registro.error }[livello] ?? registro.info;
  scrivi(`[pagina] ${String(testo).slice(0, 2000)}`);
});
gestisci("registro:percorso", () => registro.percorso());
su("lingua", (_e, l) => lingua.imposta(l));
su("esci", () => app.quit());
gestisci("schermo", () => !!finestra?.isFullScreen());
gestisci("commuta-schermo", () => {
  if (!finestra) return false;
  finestra.setFullScreen(!finestra.isFullScreen());
  return finestra.isFullScreen();
});

// ── la finestra per le opzioni (scheda Video e Generale) ─────────────
const schermoDi = () => screen.getDisplayMatching(finestra.getBounds());
gestisci("finestra:stato", () => {
  if (!finestra) return null;
  const d = schermoDi();
  return {
    schermoIntero: finestra.isFullScreen(),
    massimizzata: finestra.isMaximized(),
    contenuto: finestra.getContentSize(),
    scala: d.scaleFactor,
    area: [d.workArea.width, d.workArea.height],
    aggiornamenti: { attivo: imp.cercaAggiornamenti, motivo: aggiornamenti.supportato() },
  };
});
gestisci("finestra:schermo-intero", (_e, si) => {
  if (!finestra) return false;
  finestra.setFullScreen(!!si);
  return finestra.isFullScreen();
});
// una dimensione in pixel veri dello schermo: si esce dallo schermo intero, si toglie l'ingrandimento, si centra
gestisci("finestra:dimensione", (_e, pxL, pxA) => {
  if (!finestra) return false;
  const d = schermoDi();
  const l = Math.round(Number(pxL) / d.scaleFactor), a = Math.round(Number(pxA) / d.scaleFactor);
  if (!Number.isFinite(l) || !Number.isFinite(a) || l < 640 || a < 360 || l > d.workArea.width || a > d.workArea.height) {
    throw new Error(lingua.tr("La finestra non entra in questo schermo.", "The window does not fit on this screen."));
  }
  const applica = () => {
    if (finestra.isMaximized()) finestra.unmaximize();
    finestra.setContentSize(l, a);
    finestra.center();
    ricorda();
  };
  if (finestra.isFullScreen()) { finestra.once("leave-full-screen", () => setTimeout(applica, 60)); finestra.setFullScreen(false); }
  else applica();
  return true;
});
gestisci("impostazioni:aggiornamenti", (_e, si) => {
  imp = { ...imp, cercaAggiornamenti: !!si };
  if (!AUTOVERIFICA) impostazioni.scrivi(app.getPath("userData"), imp, true);
  return imp.cercaAggiornamenti;
});
su("autoverifica", (_e, ok, dettagli) => {
  if (!AUTOVERIFICA) return;
  registro.info(`autoverifica ${ok ? "superata" : "FALLITA"}`);
  process.stdout.write(`[autoverifica] ${ok ? "OK" : "FALLITA"}\n${dettagli}\n`);
  app.exit(ok ? 0 : 1);
});

process.on("uncaughtException", (e) => registro.error("eccezione non gestita:", e));
process.on("unhandledRejection", (e) => registro.error("promessa rifiutata:", e));

if (!AUTOVERIFICA && !app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!finestra) return;
    if (finestra.isMinimized()) finestra.restore();
    finestra.focus();
  });
  app.whenReady().then(() => {
    registro.apri(app.getPath("logs"));
    registro.info(`avvio: Il Viaggiatore ${app.getVersion()} · Electron ${process.versions.electron} · ${os.type()} ${os.release()} ${process.arch}${AUTOVERIFICA ? " · autoverifica" : ""}`);
    Menu.setApplicationMenu(null);
    protocol.handle(SCHEMA, servitore(WEB));
    salvataggi.registra(() => finestra);
    colonnaSonora.registra(WEB, () => finestra);
    creaFinestra();
    if (!AUTOVERIFICA) aggiornamenti.avvia(() => finestra, imp.cercaAggiornamenti);
    if (AUTOVERIFICA) {
      setTimeout(() => {
        process.stdout.write("[autoverifica] FALLITA\nnessuna risposta entro 180 s\n");
        app.exit(2);
      }, 180000);
    }
  });
  app.on("window-all-closed", () => app.quit());
}
