// ====================================================================
//  Le immagini promozionali: fotografa app/locandine.html in ogni formato.
// --------------------------------------------------------------------
//  Una finestra Electron FUORI SCHERMO sul server di sviluppo (5200) apre
//  locandine.html?formato=… e chiede alla pagina di dipingere (la tela ha
//  le misure esatte del formato: la finestra non conta). Il PNG torna qui
//  e ffmpeg lo scrive in JPEG di qualità alta, senza sottocampionare il
//  colore (4:4:4: i rossi del tramonto restano puliti sui bordi).
//
//  Uso (dalla cartella del progetto, col server di sviluppo acceso):
//    desktop\node_modules\.bin\electron strumenti\locandine.cjs [opzioni]
//  Opzioni
//    --formati 16x9,1x1    solo questi (default: tutti)
//    --uscita <cartella>   default grafica/branding
//    --png                 tiene anche il PNG accanto al JPEG
//  Il marchio di Runtime Multimedia viene da grafica/branding/marchi/RuntimeMultimedia_Bianco.svg.
//  Dal 21:9 esce anche la copertina del README, grafica/banner.jpg (2520×1080, metà misura).
//  Se la prima corsa dopo una modifica ai sorgenti cade («Network service crashed»: il server di sviluppo sta
//  ricaricando), basta rilanciarla.
// ====================================================================
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const RADICE = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const USCITA = path.resolve(opz("--uscita", path.join(RADICE, "grafica", "branding")));
const RUNTIME = fs.readFileSync(path.join(RADICE, "grafica", "branding", "marchi", "RuntimeMultimedia_Bianco.svg"), "utf8");
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

// tele grandi (fino a 5040×2160 e 2700×4000) una dopo l'altra: sulla GPU il processo a volte cade; il disegno su CPU
// è lento ma sicuro, e qui serve un fotogramma solo
app.disableHardwareAcceleration();
app.on("window-all-closed", () => {});

app.whenReady().then(principale).catch((e) => { console.error("ERRORE:", e?.message ?? e); app.exit(1); });

async function principale() {
  fs.mkdirSync(USCITA, { recursive: true });
  const w = new BrowserWindow({ show: false, width: 800, height: 600, webPreferences: { offscreen: true, backgroundThrottling: false } });
  w.webContents.setAudioMuted(true);
  w.webContents.on("console-message", (e) => { const m = e.message ?? ""; if (m.includes("[locandine]") || e.level === "error") console.log(m); });
  await w.loadURL("http://localhost:5200/locandine.html");
  const tutti = await w.webContents.executeJavaScript("window.__locandina.formati");
  const scelti = opz("--formati", "") ? opz("--formati").split(",") : tutti;
  for (const id of scelti) {
    try { await uno(w, id); } catch (e) { console.log(`${id}: ${e?.message ?? e}; riprovo`); await pausa(1500); await uno(w, id); }
  }
  app.quit();
}

async function uno(w, id) {
  await w.loadURL(`http://localhost:5200/locandine.html?formato=${id}`);
  for (let i = 0; i < 100 && !(await w.webContents.executeJavaScript("!!window.__locandina")); i++) await pausa(100);
  const f = await w.webContents.executeJavaScript("window.__locandina.formato");
  const dati = await w.webContents.executeJavaScript(`window.__locandina.rendi({ runtime: ${JSON.stringify(RUNTIME)} })`);
  const png = path.join(args.includes("--png") ? USCITA : os.tmpdir(), `${f.file}.png`);
  fs.writeFileSync(png, Buffer.from(dati.slice(dati.indexOf(",") + 1), "base64"));
  const jpg = path.join(USCITA, `${f.file}.jpg`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-q:v", "2", "-pix_fmt", "yuvj444p", jpg]);
  if (f.id === "21x9") {
    const banner = path.join(RADICE, "grafica", "banner.jpg");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf", "scale=2520:1080:flags=lanczos", "-q:v", "2", "-pix_fmt", "yuvj444p", banner]);
    console.log(`copertina del README: ${path.relative(RADICE, banner)}`);
  }
  if (!args.includes("--png")) fs.rmSync(png);
  console.log(`${f.nome}: ${f.w}×${f.h} → ${path.relative(RADICE, jpg)} (${(fs.statSync(jpg).size / 1e6).toFixed(1)} MB)`);
}
