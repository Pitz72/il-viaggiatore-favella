// ====================================================================
//  Registro tecnico della versione desktop.
// --------------------------------------------------------------------
//  Un file di testo con avvii, errori (del processo principale e della
//  pagina), salvataggi, aggiornamenti. È quello da allegare a una
//  segnalazione di problema. Vive nella cartella dei log dell'app:
//    Windows  %APPDATA%\Il Viaggiatore\logs\viaggiatore.log
//    Linux    ~/.config/Il Viaggiatore/logs/viaggiatore.log
//  Oltre 1 MB il file diventa viaggiatore.old.log e se ne apre uno nuovo.
// ====================================================================
const fs = require("node:fs");
const path = require("node:path");

const LIMITE = 1024 * 1024;
let file = null;

function apri(cartella) {
  fs.mkdirSync(cartella, { recursive: true });
  file = path.join(cartella, "viaggiatore.log");
  try {
    if (fs.statSync(file).size > LIMITE) fs.renameSync(file, path.join(cartella, "viaggiatore.old.log"));
  } catch { /* primo avvio */ }
  return file;
}

function scrivi(livello, ...parti) {
  const riga = `${new Date().toISOString()} ${livello.padEnd(5)} ${parti.map((p) =>
    p instanceof Error ? (p.stack ?? p.message) : typeof p === "string" ? p : JSON.stringify(p)).join(" ")}\n`;
  if (!file) { process.stderr.write(riga); return; }
  try { fs.appendFileSync(file, riga); } catch { process.stderr.write(riga); }
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
