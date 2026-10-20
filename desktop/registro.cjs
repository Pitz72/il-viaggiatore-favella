// ====================================================================
//  Registro tecnico della versione desktop.
// --------------------------------------------------------------------
//  Un file di testo con avvii, errori (del processo principale e della
//  pagina), salvataggi, aggiornamenti. È quello da allegare a una
//  segnalazione di problema. Vive nella cartella dei log dell'app:
//    Windows  %APPDATA%\Il Viaggiatore\logs\viaggiatore.log
//    Linux    ~/.config/Il Viaggiatore/logs/viaggiatore.log
//  Oltre 1 MB il file diventa viaggiatore.old.log e se ne apre uno nuovo: all'apertura e
//  anche durante la sessione, contando i byte scritti (una sessione lunga, o un errore che
//  si ripete, non fa crescere il file senza fine).
// ====================================================================
const fs = require("node:fs");
const path = require("node:path");

let limite = 1024 * 1024;
let file = null;
let scritti = 0;          // byte nel file aperto: quelli che c'erano all'apertura più quelli scritti da noi

// il file pieno diventa viaggiatore.old.log (al posto di un vecchio .old) e se ne apre uno nuovo
function ruota() {
  try { fs.renameSync(file, path.join(path.dirname(file), "viaggiatore.old.log")); }
  catch { /* il file non c'è più o è bloccato: si continua a scrivere nello stesso, senza riprovare a ogni riga */ }
  scritti = 0;
}

function apri(cartella, soglia) {
  if (soglia) limite = soglia;
  fs.mkdirSync(cartella, { recursive: true });
  file = path.join(cartella, "viaggiatore.log");
  scritti = 0;
  try { scritti = fs.statSync(file).size; } catch { /* primo avvio */ }
  if (scritti > limite) ruota();
  return file;
}

function scrivi(livello, ...parti) {
  const riga = `${new Date().toISOString()} ${livello.padEnd(5)} ${parti.map((p) =>
    p instanceof Error ? (p.stack ?? p.message) : typeof p === "string" ? p : JSON.stringify(p)).join(" ")}\n`;
  if (!file) { process.stderr.write(riga); return; }
  try {
    fs.appendFileSync(file, riga);
    scritti += Buffer.byteLength(riga);
    if (scritti > limite) ruota();
  } catch { process.stderr.write(riga); }
}

const registro = {
  apri,
  percorso: () => file,
  info: (...p) => scrivi("INFO", ...p),
  warn: (...p) => scrivi("WARN", ...p),
  error: (...p) => scrivi("ERROR", ...p),
  debug: () => {},   // electron-updater lo chiama: il dettaglio non serve
};

module.exports = registro;
