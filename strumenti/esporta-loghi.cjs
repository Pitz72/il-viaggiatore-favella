// ====================================================================
//  Esporta i due loghi d'apertura in video 4K, con il loro suono, dalle
//  animazioni vere (app/src/loghi/), fotogramma per fotogramma.
// --------------------------------------------------------------------
//  Uso (dalla cartella del progetto, col server di sviluppo su 5200):
//      desktop\node_modules\.bin\electron strumenti\esporta-loghi.cjs [cartella] [fps] [--prova]
//  Apre una finestra Electron fuori schermo 3840×2160 con lo zoom a 2× (la
//  pagina si impagina come a 1920×1080 e si disegna a 4K vero) su ?loghi=0, porta l'orologio dei loghi a ogni istante con
//  window.__loghiT, un logo alla volta (window.__loghiSolo), e passa i pixel a
//  ffmpeg. L'audio è la stessa partitura di src/loghi/suono.ts, resa offline
//  (window.__rendiSuonoLoghi). Scrive, nella cartella (predefinita: video/):
//      Runtime Multimedia - logo animato 4K.mp4   (5,7 s)
//      FAVELLA 1 - logo animato 4K.mp4            (7,6 s)
//  H.264 3840×2160 a 60 fps (o quelli dati), AAC 320 kbit/s a 48 kHz.
//  Con --prova esporta solo il primo mezzo secondo di ognuno.
// ====================================================================
const { app, BrowserWindow } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const RADICE = path.resolve(__dirname, "..");
const URL_DEV = "http://localhost:5200/?loghi=0";
const argomenti = process.argv.slice(2).filter((a) => !a.startsWith("--") && a !== ".");
const PROVA = process.argv.includes("--prova");
const CARTELLA = path.resolve(argomenti.find((a) => !/^\d+$/.test(a)) ?? path.join(RADICE, "video"));
const FPS = Number(argomenti.find((a) => /^\d+$/.test(a))) || 60;
const L = 1920, A = 1080, DENSITA = 2;
// gli istanti sono quelli di Loghi.tsx: Runtime da 0, FAVELLA da 5,6 s (DURATA_RUNTIME)
const LOGHI = [
  { id: "runtime", file: "Runtime Multimedia - logo animato 4K.mp4", inizio: 0.3, durata: 5.7, audio: ["runtime", 0.3, 5.7] },
  { id: "favella", file: "FAVELLA 1 - logo animato 4K.mp4", inizio: 5.6 - 0.2, durata: 7.6, audio: ["favella", -0.2, 7.6] },
];

const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("force-device-scale-factor", "1");

async function esporta(win, logo) {
  const js = (s) => win.webContents.executeJavaScript(s);
  // una pagina nuova per ogni logo (l'altro non deve mai essersi mosso); il dev server a volte
  // interrompe il primo caricamento mentre ricompila: si riprova
  for (let tentativo = 1; ; tentativo++) {
    try { await win.loadURL(URL_DEV); break; }
    catch (e) { if (tentativo >= 4) throw e; await dormi(800); }
  }
  win.webContents.setZoomFactor(DENSITA);
  await js(`window.__loghiSolo = ${JSON.stringify(logo.id)}`);
  for (let i = 0; i < 100 && !(await js("typeof window.__rendiSuonoLoghi === 'function'")); i++) await dormi(200);
  if (!(await js("typeof window.__rendiSuonoLoghi === 'function'"))) throw new Error("il server di sviluppo non risponde su 5200 (o non è in sviluppo)");
  await dormi(1500);   // caratteri caricati, orologio dei loghi partito

  // l'audio prima, in un file temporaneo
  const { wav } = await js(`window.__rendiSuonoLoghi(${logo.audio.map((v) => JSON.stringify(v)).join(", ")})`);
  const fileAudio = path.join(os.tmpdir(), `loghi-${logo.id}-${process.pid}.wav`);
  fs.writeFileSync(fileAudio, Buffer.from(wav, "base64"));

  const totale = Math.round((PROVA ? 0.5 : logo.durata) * FPS);
  const uscita = path.join(CARTELLA, PROVA ? `prova-${logo.id}.mp4` : logo.file);
  let ff = null, fine = null, dim = null;
  const inizio = Date.now();
  for (let i = 0; i < totale; i++) {
    await js(`window.__loghiT = ${(logo.inizio + i / FPS).toFixed(5)}; new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    const img = await win.webContents.capturePage();
    const { width, height } = img.getSize();
    if (!ff) {
      dim = `${width}x${height}`;
      ff = spawn("ffmpeg", [
        "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", dim, "-r", String(FPS), "-i", "pipe:0", "-i", fileAudio,
        ...(width === L * DENSITA ? [] : ["-vf", `scale=${L * DENSITA}:${A * DENSITA}:flags=lanczos`]),
        "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level:v", "5.2",
        "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart", uscita,
      ], { stdio: ["pipe", "inherit", "inherit"] });
      fine = new Promise((r) => ff.on("close", r));
    }
    if (`${width}x${height}` !== dim) throw new Error(`dimensione cambiata: ${width}×${height}`);
    if (!ff.stdin.write(img.toBitmap())) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 60 === 59) console.log(`${logo.id}: ${i + 1}/${totale}  ${((Date.now() - inizio) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await fine;
  fs.rmSync(fileAudio, { force: true });
  console.log(`fatto: ${uscita} (catturato a ${dim})`);
}

app.whenReady().then(async () => {
  fs.mkdirSync(CARTELLA, { recursive: true });
  const win = new BrowserWindow({
    width: L * DENSITA, height: A * DENSITA, useContentSize: true, show: false, frame: false, enableLargerThanScreen: true, x: 0, y: 0,
    webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true },
  });
  win.setContentSize(L * DENSITA, A * DENSITA);
  win.webContents.setFrameRate(60);
  for (const logo of LOGHI) await esporta(win, logo);
  app.quit();
}).catch((e) => { console.error(e); app.exit(1); });
