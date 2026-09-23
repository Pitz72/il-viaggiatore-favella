// ====================================================================
//  Il Viaggiatore — versione desktop (Electron), processo principale.
// --------------------------------------------------------------------
//  Una finestra a schermo intero che carica l'app web già costruita
//  (desktop/web, copiata da app/dist) attraverso il protocollo interno
//  app:// : niente server, niente rete. Il motore FAVELLA gira nella pagina
//  con Pyodide, esattamente come nel browser.
//
//  F11 commuta lo schermo intero. Alt+F4 (o «esci» nel menu del gioco) chiude.
//  --autoverifica: avvia il gioco senza mostrarlo, gioca qualche comando e
//  termina con codice 0 (tutto bene) o 1 (qualcosa non va). La usa la CI.
// ====================================================================
const { app, BrowserWindow, protocol, ipcMain, Menu, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const WEB = path.join(__dirname, "web");
const AUTOVERIFICA = process.argv.includes("--autoverifica");
const SCHEMA = "app";
const ORIGINE = `${SCHEMA}://gioco`;

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEMA, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true } },
]);

const TIPI = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".zip": "application/zip",
  ".whl": "application/zip",
  ".fav": "text/plain; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
};

// Serve i file di desktop/web. Supporta le richieste a intervalli (Range):
// senza, l'elemento <audio> non può saltare dentro il brano, e il trailer usa
// proprio il salto per restare sincronizzato con la musica.
async function servi(richiesta) {
  const url = new URL(richiesta.url);
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/" || rel === "") rel = "/index.html";
  const file = path.normalize(path.join(WEB, rel));
  if (!file.startsWith(WEB)) return new Response("vietato", { status: 403 });
  let stat;
  try { stat = await fs.promises.stat(file); } catch { return new Response("non trovato", { status: 404 }); }
  if (!stat.isFile()) return new Response("non trovato", { status: 404 });
  const tipo = TIPI[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  const intervallo = /^bytes=(\d*)-(\d*)$/.exec(richiesta.headers.get("range") ?? "");
  if (intervallo) {
    const inizio = intervallo[1] ? Number(intervallo[1]) : 0;
    const fine = intervallo[2] ? Math.min(Number(intervallo[2]), stat.size - 1) : stat.size - 1;
    if (inizio > fine || inizio >= stat.size) {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${stat.size}` } });
    }
    const fd = await fs.promises.open(file, "r");
    const buf = Buffer.alloc(fine - inizio + 1);
    await fd.read(buf, 0, buf.length, inizio);
    await fd.close();
    return new Response(buf, {
      status: 206,
      headers: {
        "content-type": tipo, "accept-ranges": "bytes",
        "content-range": `bytes ${inizio}-${fine}/${stat.size}`, "content-length": String(buf.length),
      },
    });
  }
  const dati = await fs.promises.readFile(file);
  return new Response(dati, { headers: { "content-type": tipo, "accept-ranges": "bytes", "content-length": String(dati.length) } });
}

let finestra = null;

function creaFinestra() {
  finestra = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 960,
    minHeight: 540,
    fullscreen: !AUTOVERIFICA,
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
    if (!url.startsWith(ORIGINE)) e.preventDefault();
  });

  finestra.webContents.on("before-input-event", (e, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      finestra.setFullScreen(!finestra.isFullScreen());
      e.preventDefault();
    }
  });

  if (!AUTOVERIFICA) finestra.once("ready-to-show", () => finestra.show());
  finestra.loadURL(`${ORIGINE}/index.html${AUTOVERIFICA ? "?autoverifica" : ""}`);
}

ipcMain.on("versione", (e) => { e.returnValue = app.getVersion(); });
ipcMain.on("esci", () => app.quit());
ipcMain.handle("schermo", () => !!finestra?.isFullScreen());
ipcMain.handle("commuta-schermo", () => {
  if (!finestra) return false;
  finestra.setFullScreen(!finestra.isFullScreen());
  return finestra.isFullScreen();
});
ipcMain.on("autoverifica", (_e, ok, dettagli) => {
  if (!AUTOVERIFICA) return;
  process.stdout.write(`[autoverifica] ${ok ? "OK" : "FALLITA"}\n${dettagli}\n`);
  app.exit(ok ? 0 : 1);
});

if (!AUTOVERIFICA && !app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!finestra) return;
    if (finestra.isMinimized()) finestra.restore();
    finestra.focus();
  });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    protocol.handle(SCHEMA, servi);
    creaFinestra();
    if (AUTOVERIFICA) {
      setTimeout(() => {
        process.stdout.write("[autoverifica] FALLITA\nnessuna risposta entro 180 s\n");
        app.exit(2);
      }, 180000);
    }
  });
  app.on("window-all-closed", () => app.quit());
}
