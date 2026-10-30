// ====================================================================
//  La lingua dei testi, nel processo principale.
// --------------------------------------------------------------------
//  La sceglie chi gioca, nella pagina (app/src/lib/opzioni.ts); la pagina la
//  manda qui a ogni cambio (canale «lingua», app/src/lib/lingua.ts), e i
//  dialoghi del sistema (esporta e apri un salvataggio, dove salvare la
//  colonna sonora) la seguono. Prima che arrivi, l'italiano.
// ====================================================================
let attuale = "it";

/** La lingua di adesso: "it" o "en". */
const lingua = () => attuale;
/** Il testo nella lingua di adesso. */
const tr = (it, en) => (attuale === "en" ? en : it);
const imposta = (l) => { attuale = l === "en" ? "en" : "it"; };

module.exports = { lingua, tr, imposta };
