// ====================================================================
//  Prova la scelta della larghezza della tela (la «calibrazione») come la farebbe il giocatore.
// --------------------------------------------------------------------
//  Il trailer disegna su una tela larga al più 2560 px; su uno schermo più grande (4K) prova 3840 e 3200 sulle
//  inquadrature più pesanti e tiene la prima che costa meno di 11 ms (Trailer.tsx → «la tela più grande»). In sviluppo la
//  scelta parte solo con «?calibra» nell'indirizzo: questo strumento lo aggiunge, apre una finestra Electron FUORI SCHERMO
//  della densità voluta e stampa la riga che il trailer scrive («[trailer] tela di 3200 px …»).
//
//  Uso (dalla cartella del progetto, a computer scarico, server di sviluppo su 5200):
//    desktop\node_modules\.bin\electron strumenti\trailer-calibra.cjs [--densita 2] [--giri 3]
//  Densità: 1 = 1920×1080 (nessuna scelta: la tela sta sotto il tetto), 1.333 = 2560×1440 (idem), 2 = 3840×2160.
// ====================================================================
const { app, BrowserWindow } = require("electron");

const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const DENSITA = Number(opz("--densita", 2));
const GIRI = Number(opz("--giri", 1));
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("force-device-scale-factor", "1");
app.on("window-all-closed", () => {});

async function unGiro() {
  const win = new BrowserWindow({
    width: 1920 * DENSITA, height: 1080 * DENSITA, useContentSize: true, show: false, frame: false, enableLargerThanScreen: true, x: 0, y: 0,
    webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true },
  });
  win.setContentSize(Math.round(1920 * DENSITA), Math.round(1080 * DENSITA));
  win.webContents.setFrameRate(60);
  let riga = null;
  win.webContents.on("console-message", (...a) => {
    const testo = typeof a[0] === "object" && a[0] && "message" in a[0] ? a[0].message : a[2];
    if (typeof testo === "string" && testo.includes("[trailer] tela di")) riga = testo;
  });
  await win.loadURL("http://localhost:5200/?calibra");
  win.webContents.setZoomFactor(DENSITA);
  await dormi(2500);
  for (let i = 0; i < 100 && !(await win.webContents.executeJavaScript("!!window.__trailer")); i++) {
    await win.webContents.executeJavaScript(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await dormi(400);
  }
  for (let i = 0; i < (DENSITA > 1.34 ? 200 : 12) && !riga; i++) await dormi(250);
  const larghezza = await win.webContents.executeJavaScript(`document.querySelector("canvas")?.width`);
  win.destroy();
  return { riga, larghezza };
}

app.whenReady().then(async () => {
  for (let i = 0; i < GIRI; i++) {
    const r = await unGiro();
    console.log(`giro ${i + 1}: tela ${r.larghezza} px — ${r.riga ?? "nessuna riga (sotto il tetto: niente da scegliere)"}`);
  }
  app.quit();
}).catch((e) => { console.error(e); app.exit(1); });
