// ====================================================================
//  I canali IPC fra la pagina e il processo principale: un solo punto.
// --------------------------------------------------------------------
//  Tutto ciò che la pagina può chiedere (salvare, uscire, scrivere nel registro,
//  installare un aggiornamento…) passa da qui. Prima di eseguire, si guarda CHI
//  chiede: dev'essere il frame della pagina dell'app (app://gioco). Un altro
//  frame, un altro indirizzo o un frame già sparito si rifiutano e finiscono nel
//  registro. In pratica la finestra non carica altro (will-navigate e
//  window.open sono chiusi), ma un controllo a ogni canale evita di fidarsi di
//  questo per sempre.
//
//  Uso:  su(canale, (evento, ...argomenti) => …)        ipcRenderer.send / sendSync
//        gestisci(canale, async (evento, ...argomenti) => …)   ipcRenderer.invoke
// ====================================================================
const { ipcMain } = require("electron");
const registro = require("./registro.cjs");

const SCHEMA = "app";
const HOST = "gioco";
const ORIGINE = `${SCHEMA}://${HOST}`;

// L'indirizzo è dell'app? Si confrontano protocollo e host, non `URL.origin`: per uno schema
// proprio come app:// l'origine di Node è «null». Un host come gioco.altro.it, o un indirizzo con
// utente o porta, non passano.
const dellApp = (indirizzo) => {
  try {
    const u = new URL(indirizzo);
    return u.protocol === `${SCHEMA}:` && u.host === HOST && !u.username && !u.password;
  }
  catch { return false; }
};

/** Chi ha mandato il messaggio è la pagina dell'app? (`senderFrame` è null se il frame non c'è più.) */
const fidato = (evento) => {
  const frame = evento?.senderFrame;
  return !!frame && dellApp(frame.url);
};

const respingi = (canale, evento) =>
  registro.warn(`IPC «${canale}» rifiutato: il mittente è ${evento?.senderFrame?.url ?? "un frame che non c'è più"}`);

function su(canale, gestore) {
  ipcMain.on(canale, (evento, ...argomenti) => {
    if (!fidato(evento)) { respingi(canale, evento); evento.returnValue = null; return; }
    return gestore(evento, ...argomenti);
  });
}

function gestisci(canale, gestore) {
  ipcMain.handle(canale, (evento, ...argomenti) => {
    if (!fidato(evento)) { respingi(canale, evento); throw new Error("mittente non autorizzato"); }
    return gestore(evento, ...argomenti);
  });
}

module.exports = { SCHEMA, HOST, ORIGINE, dellApp, fidato, su, gestisci };
