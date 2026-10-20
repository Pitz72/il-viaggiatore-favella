// ====================================================================
//  Quanto ci mette a prepararsi ogni scena del trailer (le tele dipinte una volta sola).
// --------------------------------------------------------------------
//  Una finestra Electron FUORI SCHERMO sul server di sviluppo (5200) apre il gioco e riferisce la riga che
//  il trailer scrive in sviluppo quando ha finito di preparare le tele («[trailer] tele pronte: lettere 1500 ms,
//  alba 1000 ms, …»). I tempi sono quelli «a freddo», con i loghi che girano sopra, come per il giocatore.
//  Le soglie stanno in pre-produzione/07, §6.3 (ognuna ≤ 8 s in tutto; per scena, vedi la voce).
//
//  Uso (dalla cartella del progetto, a computer scarico):
//    desktop\node_modules\.bin\electron strumenti\trailer-preparazione.cjs [--giri 3]
//  Con --giri N ripete N volte (un'apertura nuova ogni volta) e stampa anche la mediana per scena.
// ====================================================================
const { app, BrowserWindow } = require("electron");

const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const GIRI = Number(opz("--giri", 1));
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("force-device-scale-factor", "1");
app.on("window-all-closed", () => {});   // fra un giro e l'altro non ci sono finestre: non chiudere

async function unGiro() {
  const win = new BrowserWindow({
    width: 1920, height: 1080, useContentSize: true, show: false, frame: false, x: 0, y: 0,
    webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true },
  });
  win.webContents.setFrameRate(60);
  let riga = null;
  win.webContents.on("console-message", (...a) => {
    const testo = typeof a[0] === "object" && a[0] && "message" in a[0] ? a[0].message : a[2];
    if (typeof testo === "string" && testo.includes("[trailer] tele pronte")) riga = testo;
  });
  await win.loadURL("http://localhost:5200/");
  for (let i = 0; i < 400 && !riga; i++) await dormi(250);
  win.destroy();
  if (!riga) throw new Error("nessuna riga «tele pronte»: il server di sviluppo è su 5200?");
  const tempi = {};
  for (const m of riga.matchAll(/(\w+) (\d+) ms/g)) tempi[m[1]] = Number(m[2]);
  return tempi;
}

app.whenReady().then(async () => {
  const giri = [];
  for (let i = 0; i < GIRI; i++) { giri.push(await unGiro()); console.log(`giro ${i + 1}:`, Object.entries(giri[i]).map(([k, v]) => `${k} ${v}`).join(", ")); }
  if (GIRI > 1) {
    const med = (v) => v.slice().sort((a, b) => a - b)[Math.floor(v.length / 2)];
    const nomi = Object.keys(giri[0]);
    console.log("mediana:", nomi.map((n) => `${n} ${med(giri.map((g) => g[n]))}`).join(", "));
  }
  app.quit();
}).catch((e) => { console.error(e); app.exit(1); });
