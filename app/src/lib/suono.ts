// ====================================================================
//  Il bus sonoro: i volumi delle opzioni applicati a tutto ciò che suona.
// --------------------------------------------------------------------
//  Tre canali — MUSICA (il brano del trailer e del menu), VOCE (il doppiaggio
//  e Enzo nel trailer), EFFETTI (i loghi sonori, i rumori del trailer) — e
//  sopra il volume generale. Chi crea un AudioContext dal vivo chiede qui un
//  nodo per canale (`canale`) e l'uscita del contesto (`uscita`): i guadagni
//  seguono le opzioni (lib/opzioni.ts) e cambiano dal vivo, senza scatti.
//  Sull'uscita di ogni contesto stanno il volume generale, il mono (i due
//  canali fusi: chi sente da un orecchio solo non perde niente) e il silenzio
//  quando la finestra non è in primo piano, se lo si è scelto.
//  I contesti offline (gli strumenti che esportano i video e i suoni dei loghi
//  e del trailer) non passano di qui: suonano come sempre, bit per bit.
// ====================================================================
import { ascoltaOpzioni, opzioni, type Opzioni } from "./opzioni";

export type Canale = "musica" | "voce" | "effetti";

/** Il 100% di ogni canale. La voce resta al livello di sempre: 0,9, il volume di base della 1.20. */
export const TARATURA: Readonly<Record<Canale, number>> = { musica: 1, voce: 0.9, effetti: 1 };
/** Costante di tempo dei cambi (s): il cursore si muove, il suono lo segue senza scatti. */
const DOLCE = 0.04;

interface Uscita { generale: GainNode; fusore: GainNode }
const uscite = new Map<BaseAudioContext, Uscita>();
const canali: { ac: BaseAudioContext; canale: Canale; nodo: GainNode }[] = [];

/** La finestra non è in primo piano: ridotta a icona, nascosta, o con un'altra davanti. */
let fuori = false;

const livello = (o: Opzioni, c: Canale) =>
  ({ musica: o.volumeMusica, voce: o.volumeVoce, effetti: o.volumeEffetti })[c] * TARATURA[c];
const generale = (o: Opzioni) => (fuori && o.secondoPiano === "silenzia" ? 0 : o.volume);

/** Dimentica i contesti già chiusi (il trailer ne apre uno a ogni giro): senza, restavano qui finché non cambiava un'opzione. */
function sgombra() {
  for (const ac of uscite.keys()) if (ac.state === "closed") uscite.delete(ac);
  for (let i = canali.length - 1; i >= 0; i--) if (canali[i].ac.state === "closed") canali.splice(i, 1);
}

/** Vero per i contesti che rendono un file (OfflineAudioContext): quelli non si toccano. */
export const offline = (ac: BaseAudioContext) => typeof OfflineAudioContext !== "undefined" && ac instanceof OfflineAudioContext;

/** L'uscita di un contesto: volume generale → fusore (stereo o mono) → altoparlanti. Una per contesto. */
export function uscita(ac: BaseAudioContext): AudioNode {
  if (offline(ac)) return ac.destination;
  sgombra();
  let u = uscite.get(ac);
  if (!u) {
    const o = opzioni();
    const g = ac.createGain();
    g.gain.value = generale(o);
    // il fusore: a un canale solo, ciò che entra in stereo si somma (L+R)/2; uscendo verso gli altoparlanti, a due canali,
    // il suono unico va identico a destra e a sinistra. A due canali non cambia niente.
    const f = ac.createGain();
    f.channelCountMode = "explicit";
    f.channelInterpretation = "speakers";
    f.channelCount = o.mono ? 1 : 2;
    g.connect(f).connect(ac.destination);
    u = { generale: g, fusore: f };
    uscite.set(ac, u);
  }
  return u.generale;
}

/** Un nodo per un canale: ciò che ci entra esce al volume di quel canale, verso `verso` (di base l'uscita del contesto). */
export function canale(ac: BaseAudioContext, c: Canale, verso?: AudioNode): GainNode {
  const n = ac.createGain();
  if (offline(ac)) {
    n.connect(verso ?? ac.destination);   // a guadagno 1: la resa offline resta quella di sempre
    return n;
  }
  n.gain.value = livello(opzioni(), c);
  sgombra();
  n.connect(verso ?? uscita(ac));
  canali.push({ ac, canale: c, nodo: n });
  return n;
}

function aggiorna() {
  const o = opzioni();
  sgombra();
  for (const [ac, u] of uscite) {
    u.generale.gain.setTargetAtTime(generale(o), ac.currentTime, DOLCE);
    u.fusore.channelCount = o.mono ? 1 : 2;
  }
  for (const k of canali) k.nodo.gain.setTargetAtTime(livello(o, k.canale), k.ac.currentTime, DOLCE);
}

ascoltaOpzioni(aggiorna);

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const guarda = () => {
    const ora = document.hidden || !document.hasFocus();
    if (ora !== fuori) { fuori = ora; aggiorna(); }
  };
  window.addEventListener("blur", guarda);
  window.addEventListener("focus", guarda);
  document.addEventListener("visibilitychange", guarda);
}

/** Solo per il collaudo in sviluppo: i guadagni di adesso. */
export function diagnosiSuono() {
  return {
    fuori,
    uscite: [...uscite.entries()].filter(([ac]) => ac.state !== "closed")
      .map(([, u]) => ({ generale: +u.generale.gain.value.toFixed(3), canaliFusore: u.fusore.channelCount })),
    canali: canali.filter((k) => k.ac.state !== "closed").map((k) => ({ canale: k.canale, guadagno: +k.nodo.gain.value.toFixed(3) })),
  };
}
