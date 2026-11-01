// ====================================================================
//  Le schermate della pagina di presentazione (pagine/), fotografate dal gioco vero.
// --------------------------------------------------------------------
//  Una finestra Electron FUORI SCHERMO sul server di sviluppo (5200), come strumenti/trailer-cattura.cjs:
//  salta loghi, avviso e trailer, comincia un viaggio e lo gioca con window.__gioco (solo DEV), con le
//  parole del collaudo (collaudo/percorsi.py, Z1_Z4). Quattro momenti, in italiano e in inglese:
//    1. il diario      la casa, con la mappa appena presa;
//    2. il dialogo     Nunzio, col suo volto e le risposte;
//    3. la mappa       il foglio che si riempie camminando, arrivati al pozzo;
//    4. la scelta      una risposta che costa (il cibo a Saverio) e la conferma che la precede.
//  Ogni immagine: 1600 × 900, JPEG, in pagine/schermate/<n>-<nome>-<lingua>.jpg.
//  Le opzioni e i salvataggi vivono in un profilo di prova (temporaneo): niente tocca quello di chi lavora.
//
//  Uso (dalla cartella del progetto, con il server di sviluppo acceso: npm run dev --prefix app):
//    desktop\node_modules\.bin\electron strumenti\schermate.cjs [--lingue it,en] [--solo 4]
// ====================================================================
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const LINGUE = opz("--lingue", "it,en").split(",");
const SOLO = opz("--solo") ? opz("--solo").split(",").map(Number) : null;   // rifà soltanto queste (si gioca comunque tutto)
const USCITA = path.join(__dirname, "..", "pagine", "schermate");
const URL_DEV = "http://localhost:5200/";
const L = 1920, A = 1080;
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.setPath("userData", fs.mkdtempSync(path.join(os.tmpdir(), "viaggiatore-schermate-")));
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("force-device-scale-factor", "1");
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

async function giro(lingua) {
  const win = new BrowserWindow({
    width: L, height: A, useContentSize: true, show: false, frame: false, enableLargerThanScreen: true,
    webPreferences: { offscreen: true, backgroundThrottling: false },
  });
  win.setContentSize(L, A);
  win.webContents.setFrameRate(30);
  win.webContents.setAudioMuted(true);
  const js = (s) => win.webContents.executeJavaScript(s);
  const aspetta = async (cond, ms = 30000, cosa = cond) => {
    for (let t = 0; t < ms; t += 250) { if (await js(cond)) return; await dormi(250); }
    throw new Error(`[${lingua}] non arriva: ${cosa}`);
  };
  // il server di sviluppo a volte risponde a vuoto alla prima richiesta di una finestra nuova: si riprova
  const carica = async () => {
    for (let i = 1; ; i++) {
      try { return await win.loadURL(URL_DEV); } catch (e) { if (i >= 4) throw e; await dormi(1500); }
    }
  };
  // le opzioni prima che l'app le legga: la lingua scelta, nessuna voce, i pulsanti
  await carica();
  await js(`localStorage.clear(); localStorage.setItem("viaggiatore.opzioni", JSON.stringify({ lingua: "${lingua}", linguaScelta: true, voce: "nessuna", comandi: "pulsanti" }))`);
  await carica();
  // loghi, avviso e trailer si saltano con Esc, finché non c'è il menu
  for (let i = 0; i < 80 && !(await js(`!!document.querySelector('[data-voce="nuovo"]')`)); i++) {
    await js(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await dormi(500);
  }
  await aspetta(`!!document.querySelector('[data-voce="nuovo"]')`, 60000, "il menu d'avvio");
  await dormi(1500);
  await js(`document.querySelector('[data-voce="nuovo"]').click()`);
  await aspetta(`!!(window.__gioco && window.__gioco.mondo().roomId)`, 90000, "la partita");
  await dormi(3000);

  // un comando come lo dà un pulsante; una conferma che compare per strada si accetta
  const manda = async (cmd) => {
    await js(`window.__gioco.manda(${JSON.stringify(cmd)})`);
    await dormi(450);
    if (await js(`!!window.__gioco.richiesta()`)) { await js(`document.querySelector(".vg-conf-azioni .vg-pieno").click()`); await dormi(450); }
  };
  const foto = async (n, nome, attesa = 2600) => {
    if (SOLO && !SOLO.includes(n)) return;
    await dormi(attesa);   // il viandante finisce di camminare, le dissolvenze si chiudono
    const img = (await win.webContents.capturePage()).resize({ width: 1600, quality: "best" });
    const file = path.join(USCITA, `${n}-${nome}-${lingua}.jpg`);
    fs.writeFileSync(file, img.toJPEG(84));
    console.log(`  ${path.basename(file)} (${Math.round(fs.statSync(file).size / 1024)} kB)`);
  };

  for (const c of ["esamina biglietto", "nord", "nord", "prendi mappa"]) await manda(c);
  await foto(1, "diario");
  for (const c of ["prendi orologio", "prendi coltello", "sud", "est", "parla con Nunzio"]) await manda(c);
  await foto(2, "dialogo");
  for (const c of ["orologio", "torno", "mangiare", "basta", "ovest", "ovest", "ovest", "ovest", "nord"]) await manda(c);
  await js(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "m", bubbles: true }))`);
  await aspetta(`!!document.querySelector('[role="dialog"][aria-label="${lingua === "en" ? "Map" : "Mappa"}"]')`, 15000, "la mappa");
  await foto(3, "mappa", 3500);
  await js(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
  await dormi(1500);
  await manda("parla con Saverio");
  await dormi(1500);
  // la risposta si tocca col suo pulsante, come chi gioca: la conferma dice la frase, non la parola
  const i = await js(`window.__gioco.mondo().dialog.opzioni.findIndex((o) => /cibo/i.test(o))`);
  if (i < 0) throw new Error(`[${lingua}] Saverio non ha la risposta del cibo`);
  await js(`document.querySelectorAll(".vg-risposta")[${i}].click()`);
  await aspetta(`!!window.__gioco.richiesta()`, 10000, "la conferma del cibo a Saverio");
  await foto(4, "scelta", 1800);
  win.destroy();
}

app.whenReady().then(async () => {
  fs.mkdirSync(USCITA, { recursive: true });
  for (const l of LINGUE) { console.log(`[${l}]`); await giro(l); }
  app.quit();
}).catch((e) => { console.error(e); app.exit(1); });
