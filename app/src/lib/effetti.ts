// ====================================================================
//  Gli effetti sonori registrati: i rumori del censimento dei suoni
//  (pre-produzione/12-suoni.md), generati con ElevenLabs il 25 novembre 2026
//  e tagliati in `app/public/effetti/` (effetti/LEGGIMI.md).
// --------------------------------------------------------------------
//  Si caricano una volta sola all'avvio e si decodificano su un contesto
//  offline: un AudioBuffer si può suonare su qualunque contesto, dal vivo
//  (loghi, trailer, mappa) o offline (gli strumenti che esportano i video).
//  Ogni effetto ha le sue varianti (le prese, i colpi di una camminata); chi
//  suona sceglie quale con un numero, a giro.
//  Il livello: chi chiama passa il livello del suono sintetico che l'effetto
//  sostituisce (lo stesso numero di prima), e `livelli` nell'indice dice per
//  quanto moltiplicarlo perché l'effetto abbia la stessa energia del sintetico
//  (lo misura strumenti/effetti-livelli.cjs). Così la musica e la voce restano
//  sopra come prima.
//  Se l'indice o un file mancano, `suonaEffetto` dice di no e chi chiama suona
//  il suo ripiego sintetico: il gioco non resta mai muto.
// ====================================================================

export interface FileEffetto { file: string; durata: number }
export interface IndiceEffetti {
  formato: number;
  frequenza: number;
  effetti: Record<string, FileEffetto[]>;
  /** Per quanto moltiplicare il livello del suono sintetico che l'effetto sostituisce (1 se manca). */
  livelli?: Record<string, number>;
}

const buffer = new Map<string, AudioBuffer[]>();
let livelli: Record<string, number> = {};
let promessa: Promise<boolean> | null = null;

/** Carica e decodifica tutti gli effetti; vero se ci sono. Si può chiamare quante volte si vuole. */
export function caricaEffetti(): Promise<boolean> {
  if (promessa) return promessa;
  promessa = (async () => {
    try {
      if (typeof OfflineAudioContext === "undefined" || typeof fetch === "undefined") return false;
      const base = `${import.meta.env.BASE_URL}effetti/`;
      const r = await fetch(`${base}indice.json`);
      if (!r.ok) return false;
      const indice = (await r.json()) as IndiceEffetti;
      const ac = new OfflineAudioContext(1, 1, indice.frequenza || 48000);
      const voci = await Promise.all(Object.entries(indice.effetti).map(async ([chiave, file]) => {
        const bufs = await Promise.all(file.map(async (f) => {
          const dati = await fetch(`${base}${f.file}`).then((x) => (x.ok ? x.arrayBuffer() : Promise.reject(new Error(f.file))));
          return ac.decodeAudioData(dati);
        }));
        return [chiave, bufs] as const;
      }));
      for (const [chiave, bufs] of voci) buffer.set(chiave, bufs);
      livelli = indice.livelli ?? {};
      return true;
    } catch {
      buffer.clear();          // tutto o niente: un effetto a metà suonerebbe accanto ai sintetici degli altri
      return false;
    }
  })();
  return promessa;
}

/** Aspetta gli effetti al massimo `ms` millisecondi (chi parte subito non resta fermo per loro). */
export function effettiEntro(ms: number): Promise<boolean> {
  return Promise.race([caricaEffetti(), new Promise<boolean>((ok) => setTimeout(() => ok(false), ms))]);
}

/** Quante varianti ha un effetto (0 se non c'è). */
export const varianti = (chiave: string) => buffer.get(chiave)?.length ?? 0;

export interface OpzEffetto {
  /** Il livello del suono sintetico che l'effetto sostituisce. */
  g: number;
  /** Quale variante (a giro); se manca, la prima. */
  n?: number;
  /** Posizione nello stereo, da -1 a 1. */
  pan?: number;
  /** Velocità (e altezza): 1 è com'è registrato. */
  rate?: number;
  /** Per i suoni in giro continuo (il ronzio del tubo): fin quando suona; entra in `entra` secondi ed esce in `esce`. */
  giro?: { fino: number; entra: number; esce: number };
}

/**
 * Suona l'effetto `chiave` su `ac` all'istante `t`, verso `uscita`. Falso se l'effetto non c'è: chi chiama suona allora il suo
 * ripiego sintetico.
 */
export function suonaEffetto(ac: BaseAudioContext, uscita: AudioNode, chiave: string, t: number, o: OpzEffetto): boolean {
  const bufs = buffer.get(chiave);
  if (!bufs?.length) return false;
  const n = ((Math.floor(o.n ?? 0) % bufs.length) + bufs.length) % bufs.length;
  const s = ac.createBufferSource();
  s.buffer = bufs[n];
  if (o.rate && o.rate !== 1) s.playbackRate.value = o.rate;
  const g = ac.createGain();
  const livello = Math.max(0, o.g * (livelli[chiave] ?? 1));
  let nodo: AudioNode = s;
  s.connect(g);
  nodo = g;
  if (o.pan && ac.createStereoPanner) {
    const p = ac.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, o.pan));
    g.connect(p);
    nodo = p;
  }
  nodo.connect(uscita);
  if (o.giro) {
    const { fino, entra, esce } = o.giro;
    s.loop = true;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(livello, 0.0002), t + entra);
    g.gain.setValueAtTime(Math.max(livello, 0.0002), Math.max(t + entra, fino - esce));
    g.gain.exponentialRampToValueAtTime(0.0001, fino);
    s.start(t);
    s.stop(fino + 0.05);
  } else {
    g.gain.value = livello;
    s.start(t);
  }
  s.onended = () => { s.disconnect(); g.disconnect(); if (nodo !== g) nodo.disconnect(); };
  return true;
}
