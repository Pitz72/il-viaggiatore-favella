// ====================================================================
//  Le opzioni di chi gioca (pre-produzione/09-opzioni-menu-pausa.md, §3).
// --------------------------------------------------------------------
//  Un deposito solo per tutta l'app, come nel Relitto: il menu, la partita,
//  il trailer, i loghi e il bus sonoro (lib/suono.ts) leggono le stesse
//  opzioni, e un cambio vale subito, senza riavviare. Stanno nel browser
//  dell'app (localStorage «viaggiatore.opzioni»): sono comodità di chi gioca,
//  non stato del gioco; se lo spazio non c'è valgono quelle di base, e un
//  valore guasto torna al suo valore di base senza toccare gli altri.
//  La prima volta si raccolgono le scelte della voce di prima (1.20 – 1.23,
//  «viaggiatore.voce»). Niente React qui: il gancio è in useOpzioni.ts, così
//  il collaudo prova questo file in Node (app/scripts/opzioni-node.mjs).
// ====================================================================

export type ModoVoce = "recitata" | "lettore";

export interface Opzioni {
  /** la voce del gioco: il doppiaggio, oppure nessuna voce (il lettore di schermo legge il diario) */
  voce: ModoVoce;
  /** il volume generale, da 0 a 1: moltiplica i tre canali */
  volume: number;
  /** il brano del trailer e del menu */
  volumeMusica: number;
  /** il doppiaggio in partita ed Enzo nel trailer */
  volumeVoce: number;
  /** i loghi sonori e i rumori del trailer */
  volumeEffetti: number;
  /** i due canali fusi in uno, per chi sente da un orecchio solo */
  mono: boolean;
  /** quando la finestra non è in primo piano (ridotta a icona, o un'altra davanti) */
  secondoPiano: "continua" | "silenzia";
}

export const OPZIONI_DI_BASE: Readonly<Opzioni> = {
  voce: "recitata",
  volume: 1,
  volumeMusica: 1,
  volumeVoce: 1,
  volumeEffetti: 1,
  mono: false,
  secondoPiano: "continua",
};

const CHIAVE = "viaggiatore.opzioni";
/** 1.20 – 1.23: { modo, volume }, con il volume da 0 a 1 e 0,9 di base. Il 100% di adesso è quel 0,9
 *  (lib/suono.ts, TARATURA): chi l'aveva lasciato com'era lo ritrova al 100%. */
const VECCHIA_VOCE = "viaggiatore.voce";
const VOCE_DI_PRIMA = 0.9;

/** Un livello da 0 a 1, a passi di 0,05 come i cursori; altrimenti quello di base. */
const livello = (x: unknown, base: number) =>
  typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 1 ? Math.round(x * 20) / 20 : base;

/** Le opzioni lette da qualunque cosa: ogni voce valida resta, ogni voce guasta torna a quella di base. */
export function pulisci(grezzo: unknown): Opzioni {
  const d = (grezzo && typeof grezzo === "object" ? grezzo : {}) as Record<string, unknown>;
  const b = OPZIONI_DI_BASE;
  return {
    voce: d.voce === "recitata" || d.voce === "lettore" ? d.voce : b.voce,
    volume: livello(d.volume, b.volume),
    volumeMusica: livello(d.volumeMusica, b.volumeMusica),
    volumeVoce: livello(d.volumeVoce, b.volumeVoce),
    volumeEffetti: livello(d.volumeEffetti, b.volumeEffetti),
    mono: typeof d.mono === "boolean" ? d.mono : b.mono,
    secondoPiano: d.secondoPiano === "continua" || d.secondoPiano === "silenzia" ? d.secondoPiano : b.secondoPiano,
  };
}

function scrivi(o: Opzioni): boolean {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(o));
    return true;
  } catch {
    return false;   // niente spazio: le opzioni valgono fino alla chiusura
  }
}

function leggi(): Opzioni {
  try {
    const testo = localStorage.getItem(CHIAVE);
    if (testo !== null) return pulisci(JSON.parse(testo));
    const vecchia = JSON.parse(localStorage.getItem(VECCHIA_VOCE) ?? "null") as { modo?: unknown; volume?: unknown } | null;
    if (vecchia && typeof vecchia === "object") {
      const o = pulisci({
        voce: vecchia.modo,
        volumeVoce: typeof vecchia.volume === "number" ? Math.min(1, vecchia.volume / VOCE_DI_PRIMA) : undefined,
      });
      if (scrivi(o)) localStorage.removeItem(VECCHIA_VOCE);
      return o;
    }
  } catch {
    /* JSON guasto o spazio negato: quelle di base */
  }
  return { ...OPZIONI_DI_BASE };
}

// Un deposito solo per tutta l'app.
let attuali: Opzioni | null = null;
const ascoltatori = new Set<(o: Opzioni) => void>();

/** Le opzioni di adesso. */
export const opzioni = (): Opzioni => (attuali ??= leggi());

/** Cambia alcune opzioni: si scrivono, e chi ascolta lo sa subito. */
export function cambiaOpzioni(cambio: Partial<Opzioni>) {
  attuali = pulisci({ ...opzioni(), ...cambio });
  scrivi(attuali);
  for (const a of ascoltatori) a(attuali);
}

/** Tutte le opzioni di nuovo come al primo avvio. */
export const ripristinaOpzioni = () => cambiaOpzioni(OPZIONI_DI_BASE);

/** Ascolta i cambi; restituisce come smettere. */
export function ascoltaOpzioni(f: (o: Opzioni) => void): () => void {
  ascoltatori.add(f);
  return () => { ascoltatori.delete(f); };
}

/** Solo per il collaudo: dimentica ciò che è in memoria, così la prossima lettura torna al deposito. */
export function _dimentica() { attuali = null; }
