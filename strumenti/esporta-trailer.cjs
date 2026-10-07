// ====================================================================
//  Esporta il trailer in video (1080p e 720p) dal trailer vero, fotogramma
//  per fotogramma.
// --------------------------------------------------------------------
//  Uso (dalla cartella del progetto, col server di sviluppo su 5200):
//      desktop\node_modules\.bin\electron strumenti\esporta-trailer.cjs [fotogrammi]
//  Apre una finestra Electron fuori schermo 1920×1080 sul server di sviluppo,
//  porta il trailer a ogni istante con window.__trailer.vai(t) (solo DEV) e
//  passa i pixel a ffmpeg. Scrive video/il-viaggiatore-intro.mp4 (1920×1080,
//  30 fps) e video/il-viaggiatore-intro-720p.mp4. La traccia audio è muta,
//  come nei file di prima: la musica è intro.mp3 e si monta a parte.
//  Con un numero come argomento esporta solo i primi N fotogrammi (prova).
// ====================================================================
const { app, BrowserWindow } = require("electron");
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const RADICE = path.resolve(__dirname, "..");
const URL_DEV = "http://localhost:5200/";
const FPS = 30, DURATA = 88.4, L = 1920, A = 1080;
const totale = Number(process.argv.find((a) => /^\d+$/.test(a))) || Math.round(DURATA * FPS);
const FILE = path.join(RADICE, "video", "il-viaggiatore-intro.mp4");
const FILE_720 = path.join(RADICE, "video", "il-viaggiatore-intro-720p.mp4");
const TEMP = path.join(RADICE, "video", totale < DURATA * FPS ? "prova.mp4" : "_nuovo.mp4");

const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("force-device-scale-factor", "1");

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: L, height: A, useContentSize: true, show: false, frame: false, enableLargerThanScreen: true, x: 0, y: 0,
    webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true },
  });
  win.setContentSize(L, A);
  win.webContents.setFrameRate(60);
  const js = (s) => win.webContents.executeJavaScript(s);
  await win.loadURL(URL_DEV);

  // loghi e avviso si saltano con Esc; si smette appena il trailer esiste
  for (let i = 0; i < 200 && !(await js("!!window.__trailer")); i++) {
    await js(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await dormi(400);
  }
  if (!(await js("!!window.__trailer"))) throw new Error("il trailer non è partito");
  await js("window.__trailer.vai(0)");
  // le tele si dipingono a pezzi: finché c'è la scritta «PREPARO IL VIAGGIO» si aspetta
  for (let i = 0; i < 600 && (await js(`document.body.innerText.includes("PREPARO IL VIAGGIO")`)); i++) await dormi(500);
  await dormi(1500);

  const ff = spawn("ffmpeg", [
    "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", `${L}x${A}`, "-r", String(FPS), "-i", "pipe:0",
    "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-shortest",
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "12M", "-bufsize", "24M", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "64k", TEMP,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const fine = new Promise((r) => ff.on("close", r));

  const inizio = Date.now();
  for (let i = 0; i < totale; i++) {
    // due fotogrammi di attesa: il canvas e il livello dei testi si assestano sul tempo t
    await js(`window.__trailer.vai(${(i / FPS).toFixed(4)}); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    const img = await win.webContents.capturePage();
    const { width, height } = img.getSize();
    if (width !== L || height !== A) throw new Error(`dimensione inattesa ${width}×${height}`);
    if (!ff.stdin.write(img.toBitmap())) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 60 === 0) console.log(`${i}/${totale}  ${((Date.now() - inizio) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await fine;
  if (totale >= DURATA * FPS) {
    fs.renameSync(TEMP, FILE);
    spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", FILE, "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "23",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "copy", FILE_720], { stdio: "inherit" });
  }
  console.log("fatto:", totale >= DURATA * FPS ? `${FILE} e ${FILE_720}` : TEMP);
  app.quit();
}).catch((e) => { console.error(e); app.exit(1); });
