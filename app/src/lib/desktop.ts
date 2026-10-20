// ====================================================================
//  Ponte con la versione desktop (Electron).
// --------------------------------------------------------------------
//  Il preload di desktop/ espone window.viaggiatoreDesktop. Nel browser non
//  esiste: tutte le funzioni qui ricadono sul comportamento web, così la
//  stessa app gira identica nei due mondi.
// ====================================================================

export interface StatoAggiornamento { stato: "fermo" | "scarico" | "pronto"; versione?: string; percento?: number }

/** Com'è la finestra, per le opzioni: `contenuto` e `area` in pixel indipendenti dalla scala di Windows (`scala`). */
export interface StatoFinestra {
  schermoIntero: boolean;
  massimizzata: boolean;
  contenuto: [number, number];
  scala: number;
  area: [number, number];
  /** `motivo`: perché questa versione non si aggiorna da sola (portatile, sviluppo…), o null */
  aggiornamenti: { attivo: boolean; motivo: string | null };
}

interface PonteDesktop {
  versione: string;
  registro: (livello: "info" | "warn" | "error", testo: string) => void;
  aggiornamento: {
    stato: () => Promise<StatoAggiornamento>;
    quandoCambia: (fn: (s: StatoAggiornamento) => void) => () => void;
    installa: () => void;
  };
  esci: () => void;
  commutaSchermoIntero: () => Promise<boolean>;
  schermoIntero: () => Promise<boolean>;
  finestra: {
    stato: () => Promise<StatoFinestra | null>;
    schermoIntero: (si: boolean) => Promise<boolean>;
    dimensione: (larghezza: number, altezza: number) => Promise<boolean>;
    aggiornamenti: (si: boolean) => Promise<boolean>;
    quandoCambia: (fn: () => void) => () => void;
  };
  esitoAutoverifica: (ok: boolean, dettagli: string) => void;
}

const ponte = (): PonteDesktop | undefined =>
  (window as unknown as { viaggiatoreDesktop?: PonteDesktop }).viaggiatoreDesktop;

/** True dentro l'app desktop. */
export const inDesktop = (): boolean => !!ponte();

/** Chiude l'applicazione (solo desktop). */
export const esciDalGioco = () => ponte()?.esci();

/** Schermo intero: nel desktop è la finestra, nel browser la Fullscreen API. */
export async function commutaSchermoIntero(el: HTMLElement | null): Promise<boolean> {
  const p = ponte();
  if (p) return p.commutaSchermoIntero();
  if (document.fullscreenElement) { await document.exitFullscreen?.().catch(() => {}); return false; }
  await el?.requestFullscreen?.().catch(() => {});
  return !!document.fullscreenElement;
}

export async function statoSchermoIntero(): Promise<boolean> {
  const p = ponte();
  return p ? p.schermoIntero() : !!document.fullscreenElement;
}

/** La finestra, per le opzioni (solo desktop; nel browser null). */
export const statoFinestra = async (): Promise<StatoFinestra | null> => (ponte()?.finestra ? ponte()!.finestra.stato() : null);
/** Schermo intero sì o no: nel desktop la finestra, nel browser la Fullscreen API. */
export async function impostaSchermoIntero(si: boolean): Promise<boolean> {
  const p = ponte();
  if (p?.finestra) return p.finestra.schermoIntero(si);
  if (si !== !!document.fullscreenElement) return commutaSchermoIntero(document.documentElement);
  return si;
}
/** Una dimensione della finestra, in pixel veri dello schermo (solo desktop). */
export const dimensioneFinestra = (larghezza: number, altezza: number) => ponte()?.finestra?.dimensione(larghezza, altezza) ?? Promise.resolve(false);
/** Cercare gli aggiornamenti all'avvio (solo desktop; vale dall'avvio dopo). */
export const cercaAggiornamenti = (si: boolean) => ponte()?.finestra?.aggiornamenti(si) ?? Promise.resolve(false);
/** Segue i cambi della finestra (F11, trascinamento…). Restituisce come smettere. */
export function seguiFinestra(fn: () => void): () => void {
  const p = ponte();
  if (p?.finestra) return p.finestra.quandoCambia(fn);
  window.addEventListener("resize", fn);
  document.addEventListener("fullscreenchange", fn);
  return () => { window.removeEventListener("resize", fn); document.removeEventListener("fullscreenchange", fn); };
}

/** Riferisce al processo principale l'esito dell'autoverifica (solo desktop). */
export const riferisciAutoverifica = (ok: boolean, dettagli: string) =>
  ponte()?.esitoAutoverifica(ok, dettagli);

/** Una riga nel registro tecnico (solo desktop; nel browser va in console). */
export function annota(livello: "info" | "warn" | "error", testo: string) {
  const p = ponte();
  if (p) p.registro(livello, testo);
  else if (livello !== "info") console[livello === "warn" ? "warn" : "error"](testo);
}

/** Segue l'aggiornamento automatico (solo desktop). Restituisce come smettere. */
export function seguiAggiornamento(fn: (s: StatoAggiornamento) => void): () => void {
  const p = ponte();
  if (!p) return () => {};
  p.aggiornamento.stato().then(fn).catch(() => {});
  return p.aggiornamento.quandoCambia(fn);
}

export const installaAggiornamento = () => ponte()?.aggiornamento.installa();
