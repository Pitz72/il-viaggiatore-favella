// ====================================================================
//  Misura il costo di un fotogramma del trailer, istante per istante.
// --------------------------------------------------------------------
//  Una finestra Electron FUORI SCHERMO sul server di sviluppo (5200); per ogni istante chiama
//  window.__trailer.prova(t, n) (solo DEV), che sincronizza via WebGL (MAI getImageData: Chrome passa al
//  disegno su CPU e i numeri esplodono) e dà la mediana in millisecondi. Le soglie stanno in
//  pre-produzione/07, §6.3: mediana ≤ la misura di partenza + 1,5 ms; a 2560 ≤ 12 ms.
//
//  Uso (dalla cartella del progetto):
//    desktop\node_modules\.bin\electron strumenti\trailer-misura.cjs [--densita 1|1.333|2] [--istanti 3,8,13] [--n 40] [--tetto 3840]
//  Densità: 1 = 1920×1080, 1.333 = 2560×1440, 2 = 3840×2160 (la tela resta al tetto della scena).
//  Stampa una riga con la scheda e la tela, poi una tabella «istante → ms».
// ====================================================================
const { app, BrowserWindow } = require("electron");

const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const DENSITA = Number(opz("--densita", 1));
const N = Number(opz("--n", 40));
const TETTO = opz("--tetto") ? Number(opz("--tetto")) : null;   // la larghezza massima della tela (px): 2560 di partenza, 3840 per provare il 4K pieno
const ISTANTI = opz("--istanti") ? opz("--istanti").split(",").map(Number)
  : [3, 8, 13, 20, 24, 29, 31, 38, 47, 55, 61, 66, 71, 73, 75, 77, 86];
const L = 1920, A = 1080;
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("force-device-scale-factor", "1");

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: Math.round(L * DENSITA), height: Math.round(A * DENSITA), useContentSize: true, show: false, frame: false, enableLargerThanScreen: true, x: 0, y: 0,
    webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true },
  });
  win.setContentSize(Math.round(L * DENSITA), Math.round(A * DENSITA));
  win.webContents.setFrameRate(60);
  const js = (s) => win.webContents.executeJavaScript(s);
  await win.loadURL("http://localhost:5200/");
  win.webContents.setZoomFactor(DENSITA);
  await dormi(2500);
  for (let i = 0; i < 100 && !(await js("!!window.__trailer")); i++) {
    await js(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await dormi(400);
  }
  if (!(await js("!!window.__trailer"))) throw new Error("il trailer non è partito (il server di sviluppo è su 5200?)");
  // subito in pausa: se il trailer corresse mentre si preparano le tele, su un computer carico la risoluzione
  // adattiva scenderebbe (1 → 0,75 → 0,5) e le catture e le misure non sarebbero più confrontabili
  await js("window.__trailer.vai(0)");
  const t0 = Date.now();
  for (let i = 0; i < 600 && (await js(`document.body.innerText.includes("PREPARO IL VIAGGIO")`)); i++) await dormi(500);
  const preparazione = ((Date.now() - t0) / 1000).toFixed(1);
  if (TETTO) await js(`window.__trailer.tetto(${TETTO})`);
  await dormi(1000);
  console.log(await js(`JSON.stringify({ tela: document.querySelector("canvas").width + "x" + document.querySelector("canvas").height, dpr: devicePixelRatio, scheda: (() => { const g = document.createElement("canvas").getContext("webgl"); const e = g && g.getExtension("WEBGL_debug_renderer_info"); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : "?"; })() })`));
  console.log(`attesa «preparo il viaggio» dopo i loghi saltati: ${preparazione} s`);
  console.log("istante   mediana  p95   (ms, n=" + N + ")");
  for (const t of ISTANTI) {
    await js(`window.__trailer.vai(${t})`);
    await dormi(150);
    const r = JSON.parse(await js(`JSON.stringify(window.__trailer.prova(${t}, ${N}))`));
    console.log(String(t).padStart(6), "  ", r ? `${String(r.mediana).padStart(6)}  ${String(r.p95).padStart(5)}  (max ${r.max})` : "n/d");
  }
  app.quit();
}).catch((e) => { console.error(e); app.exit(1); });
