// ====================================================================
//  Cattura il trailer a istanti scelti: il «prima» e il «dopo» di ogni ritocco.
// --------------------------------------------------------------------
//  Una finestra Electron FUORI SCHERMO sul server di sviluppo (5200) porta il trailer a ogni istante con
//  window.__trailer.vai(t) (solo DEV) e ne salva un PNG. Si usa Electron fuori schermo e non il pannello
//  del browser perché da nascosto l'orologio non gira (vedi pre-produzione/07, §6.1).
//
//  Uso (dalla cartella del progetto):
//    desktop\node_modules\.bin\electron strumenti\trailer-cattura.cjs --uscita <cartella> [opzioni]
//
//  Opzioni
//    --uscita <cartella>   dove scrivere i PNG (obbligatoria)
//    --insieme             i 40 istanti canonici a 1080p (default se non si dà altro): le 29 inquadrature,
//                          il menu a 88,5 e le 10 dissolvenze (pre-produzione/07, §6.2)
//    --insieme4k           i 7 istanti ★ da guardare a 4K (con --densita 2)
//    --tempi 3,8.5,20      istanti a scelta (secondi)
//    --densita 1|2         1 = 1920×1080, 2 = 3840×2160 (finestra e zoom raddoppiati)
//    --tetto 3840          la larghezza massima della tela (px; 2560 di partenza): con --densita 2 prova il 4K pieno
//    --prefisso t          prefisso dei file (default «t»): <prefisso>-<istante>.png, il punto diventa «_»
//    --libero              NON deterministico: lascia la grana e il caso com'erano (per giudicare la grana)
//    --nascondi <selettore>  nasconde gli elementi del DOM che corrispondono (per esempio «[data-riga]»: i testi): la
//                          cattura «senza testi» serve a misurare il contrasto di una parola sul suo fondo
//
//  Deterministico (default): con il preload strumenti/trailer-preload-determinista.js due catture dello
//  stesso istante sono uguali al bit (PSNR infinito: lo prova strumenti/trailer-confronta.mjs). Confronto
//  fra due cartelle: node strumenti/trailer-confronta.mjs <prima> <dopo>.
// ====================================================================
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const flag = (nome) => args.includes(nome);

const INSIEME = [
  3.4, 5.5, 8.3, 11.0, 13.5, 16.5, 19.0, 21.5, 24.0, 28.5, 31.0, 33.0, 34.5, 41.5, 47.8, 51.0, 54.8, 57.5,
  61.5, 64.5, 66.8, 68.8, 72.0, 75.8, 79.6, 81.2, 82.8, 84.5, 87.0, 88.5,
  9.3, 17.5, 17.8, 24.9, 25.0, 25.1, 48.9, 59.4, 81.6, 81.7,
];
const INSIEME_4K = [5.5, 16.5, 21.5, 28.5, 64.5, 87.0, 88.5];

const USCITA = opz("--uscita") ? path.resolve(opz("--uscita")) : null;
if (!USCITA) { console.error("Manca --uscita <cartella>. Vedi l'intestazione di questo file."); process.exit(2); }
const DENSITA = Number(opz("--densita", 1));
const PREFISSO = opz("--prefisso", "t");
const TETTO = opz("--tetto") ? Number(opz("--tetto")) : null;
const TEMPI = opz("--tempi") ? opz("--tempi").split(",").map(Number).filter((x) => !Number.isNaN(x))
  : flag("--insieme4k") ? INSIEME_4K : INSIEME;
const L = 1920, A = 1080;
const URL_DEV = "http://localhost:5200/";
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("force-device-scale-factor", "1");

app.whenReady().then(async () => {
  fs.mkdirSync(USCITA, { recursive: true });
  const webPreferences = { offscreen: true, backgroundThrottling: false, contextIsolation: !!flag("--libero") };
  if (!flag("--libero")) { webPreferences.contextIsolation = false; webPreferences.preload = path.join(__dirname, "trailer-preload-determinista.js"); }
  const win = new BrowserWindow({
    width: L * DENSITA, height: A * DENSITA, useContentSize: true, show: false, frame: false, enableLargerThanScreen: true, x: 0, y: 0,
    webPreferences,
  });
  win.setContentSize(Math.round(L * DENSITA), Math.round(A * DENSITA));
  win.webContents.setFrameRate(60);
  const js = (s) => win.webContents.executeJavaScript(s);
  await win.loadURL(URL_DEV);
  win.webContents.setZoomFactor(DENSITA);
  await dormi(2500);
  // loghi e avviso si saltano con Esc; si smette appena il trailer esiste
  for (let i = 0; i < 100 && !(await js("!!window.__trailer")); i++) {
    await js(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await dormi(400);
  }
  if (!(await js("!!window.__trailer"))) throw new Error("il trailer non è partito (il server di sviluppo è su 5200?)");
  // subito in pausa: se il trailer corresse mentre si preparano le tele, su un computer carico la risoluzione
  // adattiva scenderebbe (1 → 0,75 → 0,5) e le catture e le misure non sarebbero più confrontabili
  await js("window.__trailer.vai(0)");
  // le tele si dipingono a pezzi: finché c'è la scritta «PREPARO IL VIAGGIO» si aspetta
  for (let i = 0; i < 600 && (await js(`document.body.innerText.includes("PREPARO IL VIAGGIO")`)); i++) await dormi(500);
  await dormi(800);
  if (TETTO) await js(`window.__trailer.tetto(${TETTO})`);
  if (opz("--nascondi")) await js(`(() => { const s = document.createElement("style"); s.textContent = ${JSON.stringify(opz("--nascondi") + "{visibility:hidden !important}")}; document.head.appendChild(s); })()`);
  const larghezzaTela = () => js(`document.querySelector("canvas").width`);
  const tela0 = await larghezzaTela();
  for (const t of TEMPI) {
    await js(`window.__trailer.vai(${t}); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    await dormi(t >= 88 ? 2400 : 150);   // il menu d'avvio ha animazioni d'entrata
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(USCITA, `${PREFISSO}-${String(t).replace(".", "_")}.png`), img.toPNG());
  }
  const tela1 = await larghezzaTela();
  console.log(`fatto: ${TEMPI.length} istanti in ${USCITA} (finestra ${L * DENSITA}×${A * DENSITA}, tela ${tela0} px${flag("--libero") ? ", non deterministico" : ""})`);
  if (tela1 !== tela0) { console.error(`ATTENZIONE: la tela è passata da ${tela0} a ${tela1} px durante la cattura (risoluzione adattiva): le catture non sono confrontabili. Rifare a computer scarico.`); app.exit(3); return; }
  app.quit();
}).catch((e) => { console.error(e); app.exit(1); });
