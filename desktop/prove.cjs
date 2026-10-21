// ====================================================================
//  Prove del processo principale che non hanno bisogno di Electron.
// --------------------------------------------------------------------
//  Si lanciano con  node desktop/prove.cjs  (la CI lo fa a ogni push).
//   · il registro tecnico ruota anche durante la sessione, contando i byte scritti;
//   · i canali IPC (ipc.cjs) rifiutano chi non è la pagina dell'app: un altro
//     indirizzo, un altro host o porta, un indirizzo con utente, un frame sparito;
//   · i salvataggi su disco (salvataggi.cjs): l'elenco libero della cartella,
//     i nomi di file ammessi e quelli no, la copia di riserva, l'eliminazione;
//   · le impostazioni della finestra (impostazioni.cjs): i valori guasti, una
//     posizione su uno schermo che non c'è più, la lettura e la scrittura.
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
  app: { getPath: () => os.tmpdir() },
  dialog: {},
  shell: {},
};
const caricaOriginale = Module._load;
Module._load = function (richiesta, ...resto) {
  return richiesta === "electron" ? finto : caricaOriginale.call(this, richiesta, ...resto);
};

const registro = require("./registro.cjs");
const ipc = require("./ipc.cjs");
// i salvataggi in una cartella di prova (mai nei Documenti di chi prova)
const cartellaSalvataggi = fs.mkdtempSync(path.join(os.tmpdir(), "viaggiatore-salvataggi-"));
process.env.VIAGGIATORE_SALVATAGGI = cartellaSalvataggi;
const salvataggi = require("./salvataggi.cjs");
salvataggi.registra(() => null);
process.on("exit", () => fs.rmSync(cartellaSalvataggi, { recursive: true, force: true }));

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

// ---- i salvataggi su disco ------------------------------------------------
const chiama = (canale, ...a) => gestori.handle.get(canale)(evento("app://gioco/index.html"), ...a);
const finto_ = (n) => JSON.stringify({ formato: "il-viaggiatore/salvataggio", n });
const zitto = async (f) => { const w = process.stderr.write; process.stderr.write = () => true; try { return await f(); } finally { process.stderr.write = w; } };

prova("i salvataggi: si scrive e si rilegge ogni genere di posto, anche quelli fino alla 1.25", async () => {
  for (const posto of ["rapido", "automatico-1", "automatico-2", "automatico-3", "s-20261020-234512-a9z0", "automatico", "posto-3"]) {
    await chiama("salvataggi:scrivi", posto, finto_(posto));
    const r = await chiama("salvataggi:leggi", posto);
    assert.equal(JSON.parse(r.testo).n, posto);
  }
  const elenco = await chiama("salvataggi:elenco");
  assert.deepEqual(elenco.map((v) => v.posto),
    ["automatico", "automatico-1", "automatico-2", "automatico-3", "posto-3", "rapido", "s-20261020-234512-a9z0"]);
});

prova("i salvataggi: i nomi che non sono di un posto si rifiutano, e l'elenco non li vede", async () => {
  for (const no of ["../fuori", "posto-7", "automatico-4", "s-1", "auto", "1", "rapido.bak", "", "C:\\x"]) {
    await assert.rejects(() => zitto(() => chiama("salvataggi:scrivi", no, finto_(no))), /Posto di salvataggio sconosciuto/, no);
  }
  fs.writeFileSync(path.join(cartellaSalvataggi, "appunti.viaggiatore"), finto_("x"));
  fs.writeFileSync(path.join(cartellaSalvataggi, "rapido.viaggiatore.bak"), finto_("x"));
  fs.writeFileSync(path.join(cartellaSalvataggi, "posto-9.viaggiatore"), finto_("x"));
  const elenco = await chiama("salvataggi:elenco");
  assert.ok(!elenco.some((v) => ["appunti", "rapido.viaggiatore", "posto-9"].includes(v.posto)), JSON.stringify(elenco.map((v) => v.posto)));
  assert.equal(fs.readdirSync(path.dirname(cartellaSalvataggi)).filter((n) => n === "fuori.viaggiatore").length, 0, "niente fuori dalla cartella");
});

prova("i salvataggi: un file guasto si riprende dalla copia di riserva; eliminato, non torna", async () => {
  const posto = "s-20261020-234513-bbbb";
  await chiama("salvataggi:scrivi", posto, finto_("primo"));
  await chiama("salvataggi:scrivi", posto, finto_("secondo"));            // la riserva ora è «primo»
  fs.writeFileSync(path.join(cartellaSalvataggi, `${posto}.viaggiatore`), "{ non è json");
  const r = await zitto(() => chiama("salvataggi:leggi", posto));
  assert.equal(JSON.parse(r.testo).n, "primo");
  await chiama("salvataggi:elimina", posto);
  assert.equal((await chiama("salvataggi:leggi", posto)).testo, null, "la riserva non resuscita un posto eliminato");
  assert.ok(!(await chiama("salvataggi:elenco")).some((v) => v.posto === posto));
});

prova("i salvataggi: con la cartella che non c'è, l'elenco è vuoto e non si rompe", async () => {
  const prima = process.env.VIAGGIATORE_SALVATAGGI;
  process.env.VIAGGIATORE_SALVATAGGI = path.join(cartellaSalvataggi, "non-c-e");
  try { assert.deepEqual(await chiama("salvataggi:elenco"), []); }
  finally { process.env.VIAGGIATORE_SALVATAGGI = prima; }
});

prova("i trofei: trofei.json si scrive e si rilegge, accanto ai salvataggi e non nell'elenco", async () => {
  assert.equal((await chiama("trofei:leggi")).testo, null, "prima volta: nessun file");
  await chiama("trofei:scrivi", JSON.stringify({ formato: "il-viaggiatore/trofei", vinti: { "le-mani-vuote": "2026-10-21T03:00:00.000Z" } }));
  assert.equal(JSON.parse((await chiama("trofei:leggi")).testo).vinti["le-mani-vuote"], "2026-10-21T03:00:00.000Z");
  assert.ok(fs.existsSync(path.join(cartellaSalvataggi, "trofei.json")));
  assert.ok(!(await chiama("salvataggi:elenco")).some((v) => v.posto.includes("trofei")), "i trofei non sono un salvataggio");
  await assert.rejects(() => zitto(() => chiama("trofei:scrivi", "x".repeat(300 * 1024))), /Trofei non validi/);
});

prova("i trofei: un file guasto si riprende dalla copia di riserva", async () => {
  await chiama("trofei:scrivi", JSON.stringify({ n: "primo" }));
  await chiama("trofei:scrivi", JSON.stringify({ n: "secondo" }));           // la riserva ora è «primo»
  fs.writeFileSync(path.join(cartellaSalvataggi, "trofei.json"), "{ guasto");
  assert.equal(JSON.parse((await zitto(() => chiama("trofei:leggi"))).testo).n, "primo");
});

// ---- la colonna sonora da scaricare (menu Extra) -------------------------
const colonna = require("./colonna-sonora.cjs");

prova("la colonna sonora: si copia l'album dell'elenco in «Il Viaggiatore - Official Soundtrack»", async () => {
  const web = fs.mkdtempSync(path.join(os.tmpdir(), "viaggiatore-web-"));
  const dove = fs.mkdtempSync(path.join(os.tmpdir(), "viaggiatore-musica-"));
  fs.mkdirSync(path.join(web, "colonna-sonora"));
  const file = ["01 - Dove finiscono i binari.mp3", "03 - Acqua ovunque, niente da bere.mp3", "copertina.jpg", "LEGGIMI.txt"];
  for (const f of file) fs.writeFileSync(path.join(web, "colonna-sonora", f), `contenuto di ${f}`);
  fs.writeFileSync(path.join(web, "colonna-sonora", "album.json"), JSON.stringify({ file }));
  const cartella = await colonna.copiaAlbum(web, dove);
  assert.equal(cartella, path.join(dove, colonna.CARTELLA_ALBUM));
  for (const f of file) assert.equal(fs.readFileSync(path.join(cartella, f), "utf8"), `contenuto di ${f}`);
  assert.ok(!fs.existsSync(path.join(cartella, "album.json")), "l'elenco non si copia");
});

prova("la colonna sonora: un elenco con un percorso o un file strano si rifiuta", async () => {
  const web = fs.mkdtempSync(path.join(os.tmpdir(), "viaggiatore-web-"));
  fs.mkdirSync(path.join(web, "colonna-sonora"));
  for (const elenco of [["../fuori.mp3"], ["sotto/brano.mp3"], ["programma.exe"], []]) {
    fs.writeFileSync(path.join(web, "colonna-sonora", "album.json"), JSON.stringify({ file: elenco }));
    await assert.rejects(() => colonna.copiaAlbum(web, os.tmpdir()), /guasto/, JSON.stringify(elenco));
  }
});

// ---- le impostazioni della finestra ---------------------------------------
const impostazioni = require("./impostazioni.cjs");

prova("le impostazioni: un valore guasto torna a quello di base, gli altri restano", () => {
  const B = impostazioni.BASE;
  assert.deepEqual(impostazioni.pulisci(null), { ...B });
  assert.deepEqual(impostazioni.pulisci({ schermoIntero: false, larghezza: 1920, altezza: 1080, x: 10, y: 20, massimizzata: true, cercaAggiornamenti: false }),
    { schermoIntero: false, larghezza: 1920, altezza: 1080, x: 10, y: 20, massimizzata: true, cercaAggiornamenti: false });
  const strano = impostazioni.pulisci({ schermoIntero: "no", larghezza: 99999, altezza: 300.5, x: 10, y: "venti", cercaAggiornamenti: 0 });
  assert.equal(strano.schermoIntero, true);
  assert.equal(strano.larghezza, B.larghezza);
  assert.equal(strano.altezza, B.altezza);
  assert.equal(strano.x, null, "x senza y non dice dove");
  assert.equal(strano.y, null);
  assert.equal(strano.cercaAggiornamenti, true);
});

prova("le impostazioni: una finestra deve cadere su uno schermo che c'è", () => {
  const due = [{ x: 0, y: 0, width: 1920, height: 1040 }, { x: 1920, y: 0, width: 2560, height: 1400 }];
  assert.equal(impostazioni.posizioneValida(100, 100, 1600, 900, due), true);
  assert.equal(impostazioni.posizioneValida(2200, 50, 1600, 900, due), true, "sul secondo schermo");
  assert.equal(impostazioni.posizioneValida(5000, 100, 1600, 900, due), false, "il terzo schermo non c'è");
  assert.equal(impostazioni.posizioneValida(-1550, 100, 1600, 900, due), false, "ne resta fuori quasi tutta");
  assert.equal(impostazioni.posizioneValida(100, 1030, 1600, 900, due), false, "la barra del titolo sotto lo schermo");
  assert.equal(impostazioni.posizioneValida(null, null, 1600, 900, due), false);
  assert.equal(impostazioni.posizioneValida(100, 100, 1600, 900, [due[1]]), false, "staccato il primo schermo");
});

prova("le impostazioni: si scrivono, si rileggono; un file guasto dà quelle di base", async () => {
  const cartella = fs.mkdtempSync(path.join(os.tmpdir(), "viaggiatore-impostazioni-"));
  try {
    assert.deepEqual(impostazioni.leggi(cartella), { ...impostazioni.BASE }, "senza file");
    impostazioni.scrivi(cartella, { ...impostazioni.BASE, schermoIntero: false, larghezza: 1280, altezza: 720, x: 5, y: 6 }, true);
    assert.deepEqual(impostazioni.leggi(cartella), { ...impostazioni.BASE, schermoIntero: false, larghezza: 1280, altezza: 720, x: 5, y: 6 });
    // le scritture ravvicinate se ne fanno una: vale l'ultima
    impostazioni.scrivi(cartella, { ...impostazioni.BASE, larghezza: 1700 });
    impostazioni.scrivi(cartella, { ...impostazioni.BASE, larghezza: 1800 });
    await new Promise((r) => setTimeout(r, 600));
    assert.equal(impostazioni.leggi(cartella).larghezza, 1800);
    assert.deepEqual(fs.readdirSync(cartella), ["impostazioni.json"], "niente .tmp lasciati in giro");
    fs.writeFileSync(path.join(cartella, "impostazioni.json"), "{ guasto");
    assert.deepEqual(impostazioni.leggi(cartella), { ...impostazioni.BASE });
  } finally { fs.rmSync(cartella, { recursive: true, force: true }); }
});

(async () => {
  for (const p of coda) await p();
  console.log(`\n${fatte} prove superate.`);
})().catch((e) => { console.error(e); process.exit(1); });
