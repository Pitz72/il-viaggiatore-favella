// ====================================================================
//  Un breve video del trailer, con la sua musica: per mostrare un «prima» e un «dopo» in movimento.
// --------------------------------------------------------------------
//  Una finestra Electron FUORI SCHERMO 1920×1080 sul server di sviluppo (5200) porta il trailer a ogni istante con
//  window.__trailer.vai(t) (solo DEV), passa i pixel a ffmpeg e monta sotto il tratto di intro.mp3 corrispondente.
//  La grana c'è (non c'è il preload deterministico) e cambia a 24 fotogrammi al secondo, dal tempo.
//
//  Uso (dalla cartella del progetto):
//    desktop\node_modules\.bin\electron strumenti\trailer-clip.cjs --da 25 --a 35 --uscita video\clip-dopo.mp4 [--fps 30]
//  I .mp4 in video/ non sono versionati.
// ====================================================================
const { app, BrowserWindow } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const DA = Number(opz("--da", 0)), A_ = Number(opz("--a", 10)), FPS = Number(opz("--fps", 30));
const USCITA = opz("--uscita") ? path.resolve(opz("--uscita")) : null;
if (!USCITA) { console.error("Manca --uscita <file.mp4>. Vedi l'intestazione di questo file."); process.exit(2); }
const RADICE = path.resolve(__dirname, "..");
const BRANO = path.join(RADICE, "app", "src", "assets", "intro.mp3");
const L = 1920, A = 1080;
const totale = Math.round((A_ - DA) * FPS);
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("force-device-scale-factor", "1");

app.whenReady().then(async () => {
  fs.mkdirSync(path.dirname(USCITA), { recursive: true });
  const win = new BrowserWindow({
    width: L, height: A, useContentSize: true, show: false, frame: false, enableLargerThanScreen: true, x: 0, y: 0,
    webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true },
  });
  win.setContentSize(L, A);
  win.webContents.setFrameRate(60);
  const js = (s) => win.webContents.executeJavaScript(s);
  await win.loadURL("http://localhost:5200/");
  for (let i = 0; i < 200 && !(await js("!!window.__trailer")); i++) {
    await js(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await dormi(400);
  }
  if (!(await js("!!window.__trailer"))) throw new Error("il trailer non è partito (il server di sviluppo è su 5200?)");
  await js("window.__trailer.vai(0)");
  for (let i = 0; i < 600 && (await js(`document.body.innerText.includes("PREPARO IL VIAGGIO")`)); i++) await dormi(500);
  await dormi(1500);

  const ff = spawn("ffmpeg", [
    "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", `${L}x${A}`, "-r", String(FPS), "-i", "pipe:0",
    "-ss", String(DA), "-t", String(A_ - DA), "-i", BRANO,
    "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "192k", "-shortest", USCITA,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const fine = new Promise((r) => ff.on("close", r));
  for (let i = 0; i < totale; i++) {
    await js(`window.__trailer.vai(${(DA + i / FPS).toFixed(4)}); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    const img = await win.webContents.capturePage();
    if (!ff.stdin.write(img.toBitmap())) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await fine;
  console.log(`fatto: ${USCITA} (${DA}–${A_} s, ${FPS} fps)`);
  app.quit();
}).catch((e) => { console.error(e); app.exit(1); });
