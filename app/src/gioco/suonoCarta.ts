// ====================================================================
//  Il suono della mappa: carta che si spiega, e che si ripiega.
// --------------------------------------------------------------------
//  Sintetizzato, come il suono dei trofei e i loghi: nessun file audio.
//  Aprendo: un soffio d'aria sotto il foglio che si allarga, un fruscio di
//  piccoli scricchiolii (rumore filtrato, tanti scatti brevi e irregolari,
//  più fitti all'inizio e a metà, mentre le pieghe cedono) e, a foglio
//  disteso, un colpetto sordo sul tavolo. Chiudendo: lo stesso, in breve.
//  Piano (−20 dB circa al picco, misurato in un contesto offline) e sul canale degli effetti del bus sonoro
//  (lib/suono.ts): il volume degli effetti, quello generale e il mono valgono
//  anche qui. Un contesto solo; se l'audio non può partire, la mappa si apre
//  lo stesso, in silenzio.
// ====================================================================
import { canale } from "../lib/suono";

const PICCO = 0.12;

let ac: AudioContext | null = null;
let uscita: AudioNode | null = null;
let rumore: AudioBuffer | null = null;

/** Quanto dura il suono di apertura e quello di chiusura, in millisecondi (l'animazione di Mappa.tsx li segue). */
export const DURATA_APRE = 900;
export const DURATA_CHIUDE = 300;

/** Un'onda di scricchiolii: `n` scatti fra `t0` e `t1`, più fitti dove `densita` è alta (0..1 lungo il tempo). */
function scricchiolii(a: BaseAudioContext, dest: AudioNode, t0: number, t1: number, n: number, densita: (x: number) => number, banda: number, q: number, livello: number) {
  const filtro = a.createBiquadFilter();
  filtro.type = "bandpass"; filtro.frequency.value = banda; filtro.Q.value = q;
  const g = a.createGain();
  g.gain.value = 0.0001;
  const s = a.createBufferSource();
  s.buffer = rumore;
  s.loop = true;
  s.connect(filtro).connect(g).connect(dest);
  for (let i = 0; i < n; i++) {
    // il momento di uno scatto: scelto a caso, ma accettato con probabilità pari alla densità lì (rifiuto)
    let x = Math.random();
    for (let k = 0; k < 8 && Math.random() > densita(x); k++) x = Math.random();
    const t = t0 + x * (t1 - t0);
    const forza = livello * (0.25 + Math.random() * 0.75);
    const durata = 0.006 + Math.random() * 0.03;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(forza, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.002 + durata);
  }
  s.start(t0, Math.random() * 0.5);
  s.stop(t1 + 0.1);
}

/** Un soffio d'aria: rumore passabasso che sale e scende. */
function soffio(a: BaseAudioContext, dest: AudioNode, t0: number, durata: number, centro: number, livello: number) {
  const filtro = a.createBiquadFilter();
  filtro.type = "bandpass"; filtro.frequency.setValueAtTime(centro * 0.6, t0); filtro.frequency.linearRampToValueAtTime(centro * 1.5, t0 + durata * 0.6); filtro.Q.value = 0.5;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(livello, t0 + durata * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durata);
  const s = a.createBufferSource();
  s.buffer = rumore;
  s.loop = true;
  s.connect(filtro).connect(g).connect(dest);
  s.start(t0, Math.random() * 0.5);
  s.stop(t0 + durata + 0.05);
}

/** Un colpetto sordo: la carta posata sul tavolo. */
function colpetto(a: BaseAudioContext, dest: AudioNode, t0: number, livello: number) {
  const filtro = a.createBiquadFilter();
  filtro.type = "lowpass"; filtro.frequency.value = 420; filtro.Q.value = 0.7;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(livello, t0 + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
  const s = a.createBufferSource();
  s.buffer = rumore;
  s.connect(filtro).connect(g).connect(dest);
  s.start(t0);
  s.stop(t0 + 0.14);
}

/** Il rumore bianco da cui nasce tutto (un buffer vale in qualunque contesto). */
function rumoreBianco(a: BaseAudioContext): AudioBuffer {
  if (!rumore) {
    rumore = a.createBuffer(1, Math.ceil(a.sampleRate * 1.2), a.sampleRate);
    const d = rumore.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return rumore;
}

/** Compone il suono dentro un contesto qualunque (anche offline, per misurarlo): `dest` è dove esce, `t` quando comincia. */
export function componiCarta(a: BaseAudioContext, dest: AudioNode, modo: "apre" | "chiude", t: number) {
  rumoreBianco(a);
  // tutto passa per un passabasso morbido (niente spigoli) e un passaalto (niente rimbombo)
  const morbido = a.createBiquadFilter();
  morbido.type = "lowpass"; morbido.frequency.value = 7000; morbido.Q.value = 0.3;
  const alto = a.createBiquadFilter();
  alto.type = "highpass"; alto.frequency.value = 90;
  morbido.connect(alto).connect(dest);

  if (modo === "apre") {
    const d = DURATA_APRE / 1000;
    soffio(a, morbido, t, d * 0.8, 1100, PICCO * 0.55);
    // due timbri di fruscio, uno più cupo e uno più secco; i primi scatti sono le pieghe che cedono
    scricchiolii(a, morbido, t + 0.02, t + d * 0.9, 46, (x) => 0.35 + 0.65 * Math.max(Math.exp(-x * 6), Math.exp(-((x - 0.55) ** 2) * 28)), 2600, 0.9, PICCO * 1.1);
    scricchiolii(a, morbido, t + 0.05, t + d * 0.85, 26, (x) => 0.3 + 0.7 * Math.exp(-((x - 0.4) ** 2) * 20), 5200, 1.1, PICCO * 0.7);
    colpetto(a, morbido, t + d * 0.88, PICCO * 0.9);
  } else {
    const d = DURATA_CHIUDE / 1000;
    soffio(a, morbido, t, d, 1400, PICCO * 0.4);
    scricchiolii(a, morbido, t, t + d, 14, () => 1, 3000, 0.9, PICCO * 0.8);
  }
}

export function suonaCarta(modo: "apre" | "chiude") {
  try {
    ac ??= new AudioContext({ latencyHint: "interactive" });
    if (ac.state !== "running") ac.resume().catch(() => {});
    uscita ??= canale(ac, "effetti");
    componiCarta(ac, uscita, modo, ac.currentTime + 0.02);
  } catch {
    /* niente audio: la mappa si apre lo stesso, in silenzio */
  }
}
