// ====================================================================
//  Le impostazioni che servono prima della pagina (piano 09, §8).
// --------------------------------------------------------------------
//  La finestra nasce prima del gioco: schermo intero o finestra, quanto è
//  grande e dove sta, e se cercare gli aggiornamenti si devono sapere qui.
//  Stanno in impostazioni.json nella cartella dei dati dell'app (accanto al
//  registro), scritte in modo atomico (.tmp e poi rinomina). Le altre opzioni
//  (i volumi, la qualità della grafica…) stanno nella pagina.
//  Ogni valore guasto torna a quello di base senza toccare gli altri; una
//  posizione che non cade su nessuno schermo (un monitor staccato) si scarta,
//  e la finestra si apre al centro di quello principale.
//  VIAGGIATORE_IMPOSTAZIONI sposta il file (collaudi): mai quello di chi prova.
// ====================================================================
const fs = require("node:fs");
const path = require("node:path");

const BASE = Object.freeze({
  schermoIntero: true,      // il predefinito è lo schermo intero (Simone, D1); la finestra scelta si ricorda
  larghezza: 1600,          // la finestra: dimensione del contenuto, in pixel indipendenti dalla scala di Windows
  altezza: 900,
  x: null,                  // la posizione della finestra; null = al centro
  y: null,
  massimizzata: false,
  cercaAggiornamenti: true,
});

const intero = (v, min, max) => (Number.isInteger(v) && v >= min && v <= max ? v : undefined);

/** Le impostazioni lette da qualunque cosa: ogni voce valida resta, ogni voce guasta torna a quella di base. */
function pulisci(grezzo) {
  const d = grezzo && typeof grezzo === "object" ? grezzo : {};
  const b = BASE;
  const larghezza = intero(d.larghezza, 640, 7680), altezza = intero(d.altezza, 360, 4320);
  const x = intero(d.x, -20000, 20000), y = intero(d.y, -20000, 20000);
  return {
    schermoIntero: typeof d.schermoIntero === "boolean" ? d.schermoIntero : b.schermoIntero,
    larghezza: larghezza ?? b.larghezza,
    altezza: altezza ?? b.altezza,
    // la posizione vale solo intera: x senza y non dice dove
    x: x !== undefined && y !== undefined ? x : null,
    y: x !== undefined && y !== undefined ? y : null,
    massimizzata: typeof d.massimizzata === "boolean" ? d.massimizzata : b.massimizzata,
    cercaAggiornamenti: typeof d.cercaAggiornamenti === "boolean" ? d.cercaAggiornamenti : b.cercaAggiornamenti,
  };
}

/** Una finestra in (x, y) grande (larghezza × altezza) si vede? Sì se almeno 120 × 80 pixel della sua parte alta cadono
 *  dentro l'area utile di uno schermo (la barra del titolo deve restare afferrabile). `aree`: [{ x, y, width, height }]. */
function posizioneValida(x, y, larghezza, altezza, aree) {
  if (x === null || y === null) return false;
  return aree.some((a) => {
    const sx = Math.max(x, a.x), dx = Math.min(x + larghezza, a.x + a.width);
    const su = Math.max(y, a.y), giu = Math.min(y + Math.min(altezza, 80), a.y + a.height);
    return dx - sx >= 120 && giu - su >= 40;
  });
}

const percorso = (cartella) => process.env.VIAGGIATORE_IMPOSTAZIONI || path.join(cartella, "impostazioni.json");

function leggi(cartella) {
  try { return pulisci(JSON.parse(fs.readFileSync(percorso(cartella), "utf8"))); }
  catch { return { ...BASE }; }
}

let attesa = null;
let ultime = null;
/** Scrive le impostazioni (atomico). Le scritture ravvicinate (si trascina la finestra) se ne fanno una sola. */
function scrivi(cartella, impostazioni, subito = false) {
  ultime = pulisci(impostazioni);
  const fai = () => {
    attesa = null;
    const file = percorso(cartella);
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(ultime, null, 1), "utf8");
      fs.renameSync(tmp, file);
    } catch { /* niente disco: valgono fino alla chiusura */ }
  };
  if (attesa) clearTimeout(attesa);
  if (subito) fai(); else attesa = setTimeout(fai, 400);
}

module.exports = { BASE, pulisci, posizioneValida, leggi, scrivi };
