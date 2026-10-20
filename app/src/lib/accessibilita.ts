// ====================================================================
//  L'accessibilità applicata alla pagina (piano 09, §3.4).
// --------------------------------------------------------------------
//  Le cinque righe delle opzioni (contrasto, testo, carattere, movimento,
//  fuoco) diventano attributi sulla radice del documento — data-contrasto,
//  data-testo, data-carattere, data-movimento, data-fuoco — e il foglio
//  accessibilita.css fa il resto. Con le righe a «normale» non c'è nessuna
//  regola in più: il gioco è quello di sempre.
//  Il movimento «come il sistema» segue l'impostazione di Windows, anche se
//  cambia a gioco aperto. Ridotto ferma ciò che si muove in partita e nei
//  menu; loghi e trailer restano sempre (Simone, D2): chi vuole li salta.
// ====================================================================
import { ascoltaOpzioni, opzioni, type Opzioni } from "./opzioni";

const RIDOTTO = "(prefers-reduced-motion: reduce)";
const sistema = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(RIDOTTO) : null;

/** Il movimento va ridotto adesso? Per l'opzione, o per Windows quando l'opzione dice «come il sistema». */
export function movimentoRidotto(o: Opzioni = opzioni()): boolean {
  return o.movimento === "ridotto" || (o.movimento === "sistema" && !!sistema?.matches);
}

/** Quanto crescono i pannelli col testo grande (la loro base in em). */
export const scalaTesto = (o: Opzioni = opzioni()) => (o.testo === "grande" ? 1.15 : 1);

function applica(o: Opzioni = opzioni()) {
  if (typeof document === "undefined") return;
  const d = document.documentElement.dataset;
  d.contrasto = o.contrasto;
  d.testo = o.testo;
  d.carattere = o.carattere;
  d.movimento = movimentoRidotto(o) ? "ridotto" : "pieno";
  d.fuoco = o.fuoco;
}

applica();
ascoltaOpzioni(applica);
sistema?.addEventListener?.("change", () => applica());
