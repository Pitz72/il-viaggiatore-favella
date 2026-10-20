// ====================================================================
//  Prove del processo principale che non hanno bisogno di Electron.
// --------------------------------------------------------------------
//  Si lanciano con  node desktop/prove.cjs  (la CI lo fa a ogni push).
//   · il registro tecnico ruota anche durante la sessione, contando i byte scritti;
//   · i canali IPC (ipc.cjs) rifiutano chi non è la pagina dell'app: un altro
//     indirizzo, un altro host o porta, un indirizzo con utente, un frame sparito.
//  «electron» è sostituito da un finto che ricorda i gestori registrati.
//  Il controllo vero, con un Electron vero, lo fa --autoverifica sul pacchetto.
// ====================================================================
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const os = require("node:os");
const path = require("node:path");

const gestori = { on: new Map(), handle: new Map() };
const finto = {
  ipcMain: {
    on: (canale, f) => gestori.on.set(canale, f),
    handle: (canale, f) => gestori.handle.set(canale, f),
  },
};
const caricaOriginale = Module._load;
Module._load = function (richiesta, ...resto) {
  return richiesta === "electron" ? finto : caricaOriginale.call(this, richiesta, ...resto);
};

const registro = require("./registro.cjs");
const ipc = require("./ipc.cjs");

let fatte = 0;
const coda = [];
const prova = (nome, f) => coda.push(async () => { await f(); fatte++; console.log(`ok  ${nome}`); });

// ---- il registro -----------------------------------------------------------
const cartella = fs.mkdtempSync(path.join(os.tmpdir(), "viaggiatore-registro-"));
const dimensione = (nome) => { try { return fs.statSync(path.join(cartella, nome)).size; } catch { return -1; } };
process.on("exit", () => fs.rmSync(cartella, { recursive: true, force: true }));
const silenzio = process.stderr.write.bind(process.stderr);

prova("il registro ruota durante la sessione, oltre la soglia", () => {
  registro.apri(cartella, 4000);
  const riga = "x".repeat(150);
  for (let i = 0; i < 100; i++) registro.info(`riga ${i} ${riga}`);           // ~16 kB: la soglia è 4 kB
  assert.ok(dimensione("viaggiatore.old.log") > 0, "manca il file ruotato");
  const corrente = dimensione("viaggiatore.log");
  assert.ok(corrente >= 0 && corrente <= 4000 + 400, `il file corrente è grande ${corrente} byte`);
  assert.ok(dimensione("viaggiatore.old.log") <= 4000 + 400, "anche il file ruotato rispetta la soglia");
  const ultime = fs.readFileSync(path.join(cartella, "viaggiatore.log"), "utf8");
  assert.ok(ultime.includes("riga 99 "), "l'ultima riga dev'essere nel file corrente, non persa");
});

prova("la rotazione conta anche i byte che c'erano già all'apertura", () => {
  fs.writeFileSync(path.join(cartella, "viaggiatore.log"), "y".repeat(3900));
  registro.apri(cartella, 4000);
  registro.info("z".repeat(200));                                              // 3900 + ~230 > 4000
  assert.ok(dimensione("viaggiatore.old.log") >= 3900, "il file già grosso doveva ruotare alla prima riga che lo supera");
  assert.ok(dimensione("viaggiatore.log") <= 0, "il nuovo file parte vuoto");
});

prova("un file più grande della soglia ruota già all'apertura", () => {
  fs.writeFileSync(path.join(cartella, "viaggiatore.log"), "w".repeat(5000));
  registro.apri(cartella, 4000);
  assert.equal(dimensione("viaggiatore.log"), -1);
  assert.equal(dimensione("viaggiatore.old.log"), 5000);
});

// ---- i canali IPC ----------------------------------------------------------
const evento = (url) => ({ senderFrame: url === undefined ? null : { url }, returnValue: undefined });

prova("dellApp accetta solo app://gioco", () => {
  for (const ok of ["app://gioco/index.html", "app://gioco/", "app://gioco/index.html?autoverifica", "app://gioco"]) assert.equal(ipc.dellApp(ok), true, ok);
  for (const no of ["app://gioco.altro.it/", "app://altro/", "app://utente@gioco/", "app://gioco:81/", "https://gioco/", "file:///C:/gioco/index.html",
    "http://app/gioco", "app:gioco", "", "non un indirizzo", "javascript:alert(1)"]) assert.equal(ipc.dellApp(no), false, no);
});

prova("fidato guarda il frame che ha mandato il messaggio", () => {
  assert.equal(ipc.fidato(evento("app://gioco/index.html")), true);
  assert.equal(ipc.fidato(evento("https://example.com/")), false);
  assert.equal(ipc.fidato(evento(undefined)), false);          // frame sparito
  assert.equal(ipc.fidato({}), false);
  assert.equal(ipc.fidato(undefined), false);
});

prova("su() esegue per la pagina dell'app e rifiuta gli altri", () => {
  let chiamate = 0;
  ipc.su("prova-su", (e, a) => { chiamate++; e.returnValue = `ciao ${a}`; });
  const f = gestori.on.get("prova-su");
  const buono = evento("app://gioco/index.html");
  f(buono, "mondo");
  assert.equal(chiamate, 1); assert.equal(buono.returnValue, "ciao mondo");
  for (const url of ["https://example.com/", "app://gioco.altro.it/", undefined]) {
    const cattivo = evento(url); process.stderr.write = () => true;
    try { f(cattivo, "mondo"); } finally { process.stderr.write = silenzio; }
    assert.equal(cattivo.returnValue, null, `risposta a ${url}`);
  }
  assert.equal(chiamate, 1, "un mittente estraneo non deve far eseguire il gestore");
});

prova("gestisci() esegue per la pagina dell'app e lancia per gli altri", async () => {
  let chiamate = 0;
  ipc.gestisci("prova-gestisci", async (_e, a) => { chiamate++; return a * 2; });
  const f = gestori.handle.get("prova-gestisci");
  assert.equal(await f(evento("app://gioco/index.html"), 21), 42);
  for (const url of ["https://example.com/", "app://utente@gioco/", undefined]) {
    process.stderr.write = () => true;
    try { assert.throws(() => f(evento(url), 21), /non autorizzato/); } finally { process.stderr.write = silenzio; }
  }
  assert.equal(chiamate, 1);
});

(async () => {
  for (const p of coda) await p();
  console.log(`\n${fatte} prove superate.`);
})().catch((e) => { console.error(e); process.exit(1); });
