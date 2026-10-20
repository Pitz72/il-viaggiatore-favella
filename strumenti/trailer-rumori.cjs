// ====================================================================
//  I rumori del trailer (passi, carta, tasti, soffi, timbro) con la musica sotto, resi OFFLINE in un file WAV.
// --------------------------------------------------------------------
//  Per ascoltare un «prima» e un «dopo» del suono senza aprire il trailer: una finestra Electron fuori schermo sul server di
//  sviluppo (5200) carica la colonna sonora vera (trailer/audio.ts) su un OfflineAudioContext, ci mette `intro.mp3` dal punto
//  `--da` e fa suonare gli eventi di scaletta.ts di quel tratto con il livello che hanno con il brano (0,55). Passa dal master e
//  dal compressore come nell'app. Non c'è la latenza d'uscita: quella si sente solo sulla macchina vera.
//
//  Uso (dalla cartella del progetto):
//    desktop\node_modules\.bin\electron strumenti\trailer-rumori.cjs --da 17.6 --a 25.2 --uscita video\rumori-dopo.wav
//  I file in video/ non sono versionati.
// ====================================================================
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const DA = Number(opz("--da", 17.6)), A_ = Number(opz("--a", 25.2));
const USCITA = opz("--uscita") ? path.resolve(opz("--uscita")) : null;
if (!USCITA) { console.error("Manca --uscita <file.wav>. Vedi l'intestazione di questo file."); process.exit(2); }
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));
const MP3_BASE64 = fs.readFileSync(path.join(__dirname, "..", "app", "src", "assets", "intro.mp3")).toString("base64");

function wav(canali, sr) {
  const n = canali[0].length, k = canali.length, buf = Buffer.alloc(44 + n * k * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * k * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(k, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * k * 2, 28); buf.writeUInt16LE(k * 2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * k * 2, 40);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < k; c++) { const v = Math.max(-1, Math.min(1, canali[c][i])); buf.writeInt16LE(Math.round(v * 32767), o); o += 2; }
  return buf;
}

app.whenReady().then(async () => {
  fs.mkdirSync(path.dirname(USCITA), { recursive: true });
  const win = new BrowserWindow({ width: 800, height: 600, show: false, webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true } });
  const js = (s) => win.webContents.executeJavaScript(s);
  await win.loadURL("http://localhost:5200/");
  await dormi(2500);
  const risultato = await js(`(async () => { try {
    const A = await import('/src/trailer/audio.ts');
    const S = await import('/src/trailer/scaletta.ts');
    const sr = 44100, durata = ${A_ - DA};
    const off = new OfflineAudioContext(2, Math.ceil(sr * durata), sr);
    let cursore = 0;
    Object.defineProperty(off, 'currentTime', { get: () => cursore });      // il «ora» di suona() lo decidiamo noi
    const Originale = window.AudioContext;
    window.AudioContext = function () { return off; };
    const c = new A.ColonnaSonora();
    c.costruisci();
    window.AudioContext = Originale;
    c.master.gain.value = 0.9; c.vento.gain.value = 0; c.bordone.gain.value = 0; c.gTerza.gain.value = 0;
    const musica = off.createBufferSource();
    const bytes = Uint8Array.from(atob(${JSON.stringify(MP3_BASE64)}), (c) => c.charCodeAt(0)).buffer;     // il brano si legge da disco, non dal server di sviluppo
    musica.buffer = await off.decodeAudioData(bytes);
    musica.connect(c.master); musica.start(0, ${DA}, durata);
    let n = 0;
    for (const e of S.EVENTI) {
      if (e.t < ${DA} || e.t >= ${A_} || e.tipo === 'rintocco' || e.tipo === 'tonfo') continue;
      cursore = e.t - ${DA}; c.suona(e.tipo, (e.vol ?? 1) * 0.55, e); n++;
    }
    cursore = 0;
    const reso = await off.startRendering();
    return { sr, eventi: n, canali: [reso.getChannelData(0), reso.getChannelData(1)] };
  } catch (e) { return { errore: String((e && e.message) || e) + ' | ' + String((e && e.stack) || '').slice(0, 400) }; } })()`);
  if (risultato.errore) throw new Error(risultato.errore);
  fs.writeFileSync(USCITA, wav(risultato.canali.map((c) => Float32Array.from(Object.values(c))), risultato.sr));
  console.log(`fatto: ${USCITA} (${DA}–${A_} s, ${risultato.eventi} rumori)`);
  app.quit();
}).catch((e) => { console.error(e instanceof Error ? e.stack : String(e)); app.exit(1); });
