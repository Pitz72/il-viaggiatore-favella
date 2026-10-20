// ====================================================================
//  I rumori del trailer (passi, carta, tasti, soffi, timbro) con la musica sotto e la voce di Enzo, resi OFFLINE in un WAV.
// --------------------------------------------------------------------
//  Per ascoltare un «prima» e un «dopo» del suono senza aprire il trailer: una finestra Electron fuori schermo sul server di
//  sviluppo (5200) carica la colonna sonora vera (trailer/audio.ts) su un OfflineAudioContext, ci mette `intro.mp3` dal punto
//  `--da`, fa suonare gli eventi di scaletta.ts di quel tratto con il livello che hanno con il brano (0,55) e la voce del
//  trailer con la musica che le scende sotto (`--senza-voce` per toglierla). Il lavoro lo fa strumenti/trailer-mix.cjs,
//  lo stesso dell'esportatore dei video. Non c'è la latenza d'uscita: quella si sente solo sulla macchina vera.
//
//  Uso (dalla cartella del progetto):
//    desktop\node_modules\.bin\electron strumenti\trailer-rumori.cjs --da 17.6 --a 25.2 --uscita video\rumori-dopo.wav
//  I file in video/ non sono versionati.
// ====================================================================
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { mixOffline, wav } = require("./trailer-mix.cjs");

const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const DA = Number(opz("--da", 17.6)), A_ = Number(opz("--a", 25.2));
const VOCE = !args.includes("--senza-voce");
const USCITA = opz("--uscita") ? path.resolve(opz("--uscita")) : null;
if (!USCITA) { console.error("Manca --uscita <file.wav>. Vedi l'intestazione di questo file."); process.exit(2); }
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.whenReady().then(async () => {
  fs.mkdirSync(path.dirname(USCITA), { recursive: true });
  const win = new BrowserWindow({ width: 800, height: 600, show: false, webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true } });
  await win.loadURL("http://localhost:5200/");
  await dormi(2500);
  const r = await mixOffline(win, DA, A_, { voce: VOCE });
  fs.writeFileSync(USCITA, wav(r.pcm, r.sr));
  console.log(`fatto: ${USCITA} (${DA}–${A_} s, ${r.eventi} rumori, ${r.frasi} frasi di voce)`);
  app.quit();
}).catch((e) => { console.error(e instanceof Error ? e.stack : String(e)); app.exit(1); });
