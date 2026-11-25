// ====================================================================
//  I livelli degli effetti registrati: ogni rumore con la stessa energia del sintetico che sostituisce.
// --------------------------------------------------------------------
//  Gli effetti (app/public/effetti/, effetti/LEGGIMI.md) sono tutti al picco di -1,5 dBFS; nel gioco chi li suona passa il livello
//  del suono sintetico di prima, e `livelli` nell'indice dice per quanto moltiplicarlo. Questo strumento lo misura: in una finestra
//  Electron fuori schermo sul server di sviluppo (5200) rende OFFLINE, uno alla volta, il rumore sintetico (le stesse chiamate della
//  partitura dei loghi, della colonna del trailer, della carta della mappa) e l'effetto registrato con lo stesso livello; il
//  moltiplicatore è la radice del rapporto delle due energie. Per i suoni che cambiano a ogni colpo (passi, tasti, carta) somma
//  più colpi con semi diversi. Scrive `livelli` in app/public/effetti/indice.json e stampa la tabella.
//  Senza riverbero: la stanza è la stessa per i due, e il suo caso (un impulso a rumore) falserebbe il confronto.
//
//  Uso (dalla cartella del progetto, con `npm run dev` acceso in app/ sulla 5200):
//    desktop\node_modules\.bin\electron strumenti\effetti-livelli.cjs [--prova]
//  --prova: misura e stampa, senza scrivere l'indice.
// ====================================================================
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const INDICE = path.join(__dirname, "..", "app", "public", "effetti", "indice.json");
const PROVA = process.argv.includes("--prova");

/** Gira nella pagina: restituisce { chiave: { sintetico, registrato } } con le energie (somma dei quadrati). */
async function misura() {
  const L = await import("/src/loghi/suono.ts");
  const E = await import("/src/lib/effetti.ts");
  const A = await import("/src/trailer/audio.ts");
  const C = await import("/src/gioco/suonoCarta.ts");
  if (!(await E.caricaEffetti())) throw new Error("gli effetti non si caricano");
  const SR = 48000;
  const energia = (buf) => { let e = 0; for (let c = 0; c < buf.numberOfChannels; c++) for (const v of buf.getChannelData(c)) e += v * v; return e; };
  async function rendi(durata, fn) {
    const off = new OfflineAudioContext(2, Math.ceil(SR * durata), SR);
    await fn(off);
    return energia(await off.startRendering());
  }
  const P = L.primitivi;
  // i loghi: un banco senza riverbero, il sintetico com'è nella partitura, l'effetto con lo stesso g
  const loghi = {
    "tv-acceso": [0.42, (b) => { P.colpo(b, 0, 0.42, 95, 38, 0.36); P.rumore(b, 0, { dur: 0.16, g: 0.16, tipo: "highpass", f: 1800, f1: 7000 }); P.tono(b, 0.02, { f: 7800, f1: 9400, dur: 0.32, g: 0.012, att: 0.02 }); }],
    "schermo": [0.3, (b) => P.rumore(b, 0, { dur: 0.42, g: 0.3, tipo: "bandpass", f: 380, f1: 3600, q: 1.1, att: 0.12 })],
    "testina": [0.05, (b) => { P.tono(b, 0, { f: 196, f1: 587, dur: 1.0, g: 0.05, tipo: "triangle", att: 0.15, lp: 900, lp1: 2600 }); P.rumore(b, 0, { dur: 0.9, g: 0.035, tipo: "bandpass", f: 2000, f1: 6000, q: 3, att: 0.2 }); }],
    "tic": [0.085, (b) => P.rumore(b, 0, { dur: 0.024, g: 0.085, tipo: "highpass", f: 4200 })],
    "zip": [0.055, (b) => { P.tono(b, 0, { f: 170, f1: 760, dur: 0.36, g: 0.055, tipo: "sawtooth", att: 0.04, lp: 700, lp1: 3800 }); P.rumore(b, 0, { dur: 0.36, g: 0.05, tipo: "bandpass", f: 900, f1: 5200, q: 2, att: 0.05 }); }],
    "colpo": [0.95, (b) => P.colpo(b, 0, 0.95, 130, 40, 0.55)],
    "riflesso": [0.05, (b) => { P.rumore(b, 0, { dur: 0.6, g: 0.05, tipo: "bandpass", f: 2600, f1: 9500, q: 2.5, att: 0.24 }); P.tono(b, 0.1, { f: 2637, f1: 3951, dur: 0.5, g: 0.012, att: 0.15 }); }],
    "spegne": [0.11, (b) => { P.tono(b, 0, { f: 1400, f1: 70, dur: 0.3, g: 0.11, att: 0.004 }); P.rumore(b, 0, { dur: 0.26, g: 0.09, tipo: "lowpass", f: 4200, f1: 220 }); }],
    "punto": [0.26, (b) => { P.colpo(b, 0, 0.26, 80, 36, 0.24); P.tono(b, 0.02, { f: 5200, f1: 2400, dur: 0.22, g: 0.016, att: 0.004 }); }],
    "scintilla": [0.03, (b) => P.rumore(b, 0, { dur: 0.34, g: 0.03, tipo: "highpass", f: 5200, att: 0.2 })],
    "libro": [0.42, (b) => { P.colpo(b, 0, 0.42, 110, 48, 0.4); P.rumore(b, 0, { dur: 0.5, g: 0.2, tipo: "lowpass", f: 1100, f1: 260, att: 0.03 }); }],
    "pagina": [0.11, (b) => P.fruscio(b, 0, 0.11)],
    "penna": [0.028, (b) => { P.tono(b, 0, { f: 1180, f1: 1760, dur: 0.8, g: 0.024, att: 0.2 }); P.rumore(b, 0, { dur: 0.8, g: 0.028, tipo: "bandpass", f: 5200, f1: 8200, q: 4, att: 0.25 }); }],
    "soffio-lettera": [0.055, (b) => P.rumore(b, 0, { dur: 0.16, g: 0.055, tipo: "bandpass", f: 1500, f1: 650, q: 1.4, att: 0.05 })],
    "tasto-motto": [0.05, (b) => P.tasto(b, 0, 0.05)],
  };
  const banco = (off) => { const b = P.banco(off, off.destination); b.riv.gain.value = 0; return b; };
  const out = {};
  for (const [chiave, [g, sintetico]] of Object.entries(loghi)) {
    const n = E.varianti(chiave);
    let s = 0, r = 0;
    for (let i = 0; i < Math.max(3, n); i++) {          // il rumore cambia a ogni colpo, e le varianti sono diverse: si sommano
      s += await rendi(2, (off) => sintetico(banco(off)));
      r += await rendi(2, (off) => { const b = banco(off); E.suonaEffetto(off, P.voce(b, 0, 0), chiave, 0, { g, n: i }); });
    }
    out[chiave] = { sintetico: s, registrato: r };
  }
  // il ronzio del tubo, in giro per 4,3 secondi
  out["ronzio"] = {
    sintetico: await rendi(5, (off) => P.ronzio(banco(off), 0, 4.3, 0.018)),
    registrato: await rendi(5, (off) => { const b = banco(off); E.suonaEffetto(off, P.voce(b, 0, 0), "ronzio", 0, { g: 0.018, giro: { fino: 4.3, entra: 0.4, esce: 0.12 } }); }),
  };
  // il trailer: la colonna vera su un contesto offline, una volta coi sintetici (registrato spento) e una con gli effetti
  async function colonna(off, conEffetti) {
    const Originale = window.AudioContext;
    window.AudioContext = function () { return off; };
    const c = new A.ColonnaSonora();
    c.costruisci();
    window.AudioContext = Originale;
    c.master.gain.value = 1; c.vento.gain.value = 0; c.bordone.gain.value = 0; c.gTerza.gain.value = 0;
    if (!conEffetti) c.registrato = () => false;
    return c;
  }
  const trailer = {
    "busta": { tipo: "carta" }, "biglietto": { tipo: "carta", biglietto: true }, "tasto": { tipo: "tasto" }, "timbro": { tipo: "timbro" },
    "soffio": { tipo: "soffio" }, "passo-asfalto": { tipo: "passo", terreno: "asfalto" }, "passo-crosta": { tipo: "passo", terreno: "crosta" },
    "passo-sale": { tipo: "passo", terreno: "sale" }, "passo-sassi": { tipo: "passo", terreno: "sassi" },
  };
  for (const [chiave, ev] of Object.entries(trailer)) {
    let s = 0, r = 0;
    for (let i = 0; i < 8; i++) {
      const e = { ...ev, t: 1 + i * 0.731, piede: i % 2 };
      s += await rendi(1.5, async (off) => (await colonna(off, false)).suona(ev.tipo, 1, e));
      r += await rendi(1.5, async (off) => (await colonna(off, true)).suona(ev.tipo, 1, e));
    }
    out[chiave] = { sintetico: s, registrato: r };
  }
  // la mappa
  for (const [chiave, modo] of [["carta-apre", "apre"], ["carta-chiude", "chiude"]]) {
    let s = 0, r = 0;
    for (let i = 0; i < 3; i++) {
      s += await rendi(1.5, (off) => C.componiCarta(off, off.destination, modo, 0, true));
      r += await rendi(1.5, (off) => C.componiCarta(off, off.destination, modo, 0));
    }
    out[chiave] = { sintetico: s, registrato: r };
  }
  return out;
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600, show: false, webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true } });
  try {
    await win.loadURL("http://localhost:5200/");
    const misure = await win.webContents.executeJavaScript(`(${misura.toString()})()`);
    const indice = JSON.parse(fs.readFileSync(INDICE, "utf8"));
    const prima = indice.livelli ?? {};
    const livelli = {};
    console.log("chiave".padEnd(16), "sintetico".padStart(10), "registrato".padStart(11), "livello".padStart(8));
    for (const [k, m] of Object.entries(misure)) {
      // le misure dell'effetto sono già col livello di prima: il nuovo è il vecchio per la radice del rapporto
      const l = (prima[k] ?? 1) * Math.sqrt(m.sintetico / Math.max(m.registrato, 1e-12));
      livelli[k] = Math.round(l * 1000) / 1000;
      console.log(k.padEnd(16), m.sintetico.toFixed(3).padStart(10), m.registrato.toFixed(3).padStart(11), livelli[k].toFixed(3).padStart(8));
    }
    const mancano = Object.keys(indice.effetti).filter((k) => !(k in livelli));
    if (mancano.length) console.log("senza misura:", mancano.join(", "));
    if (!PROVA) {
      indice.livelli = livelli;
      fs.writeFileSync(INDICE, JSON.stringify(indice, null, 1) + "\n");
      console.log(`scritti ${Object.keys(livelli).length} livelli in ${path.relative(process.cwd(), INDICE)}`);
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    app.quit();
  }
});
