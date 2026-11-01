// ====================================================================
//  Il deposito dei trofei (pre-produzione/09-opzioni-menu-pausa.md, §7.1).
// --------------------------------------------------------------------
//  Che cosa si è vinto e quando, per tutti i viaggi: sul desktop il file
//  Documenti/Il Viaggiatore/trofei.json (desktop/salvataggi.cjs: scrittura
//  atomica e copia di riserva), nel browser localStorage «viaggiatore.trofei».
//  Un trofeo vinto resta, anche ricominciando o caricando; «azzera i trofei»
//  (opzioni, Generale) li toglie tutti e non tocca i salvataggi.
//  In più il punto più lontano che ogni viaggio ha raggiunto (quanti comandi):
//  caricare un salvataggio di prima di quel punto è tornare indietro, e la
//  sfida «Senza voltarti» di quel viaggio cade (gioco/trofei.ts, Sfide).
//  Le regole stanno in gioco/trofei.ts; qui solo il deposito.
// ====================================================================
import { PER_ID } from "../gioco/trofei";

export const FORMATO_TROFEI = "il-viaggiatore/trofei";
/** Quanti viaggi si ricordano per il punto più lontano: i più recenti. */
const VIAGGI_RICORDATI = 40;
const CHIAVE = "viaggiatore.trofei";

export interface Deposito {
  /** id del trofeo → quando l'hai vinto (ISO 8601) */
  vinti: Record<string, string>;
  /** id del viaggio → quanti comandi aveva al punto più lontano */
  viaggi: Record<string, number>;
}

/** Il deposito letto da qualunque cosa: si tengono solo i trofei che esistono, con una data vera, e i viaggi buoni. */
export function pulisciDeposito(grezzo: unknown, esiste: (id: string) => boolean = (id) => PER_ID.has(id)): Deposito {
  const d = (grezzo && typeof grezzo === "object" ? grezzo : {}) as Record<string, unknown>;
  const vinti: Record<string, string> = {};
  const v = (d.vinti && typeof d.vinti === "object" ? d.vinti : {}) as Record<string, unknown>;
  for (const [id, quando] of Object.entries(v)) {
    if (esiste(id) && typeof quando === "string" && !Number.isNaN(Date.parse(quando))) vinti[id] = quando;
  }
  // prima si scartano i viaggi guasti, poi si tengono i più recenti
  const p = (d.viaggi && typeof d.viaggi === "object" ? d.viaggi : {}) as Record<string, unknown>;
  const buoni = Object.entries(p).filter((e): e is [string, number] =>
    /^[0-9a-z-]{4,40}$/.test(e[0]) && typeof e[1] === "number" && Number.isInteger(e[1]) && e[1] >= 0);
  return { vinti, viaggi: Object.fromEntries(buoni.slice(-VIAGGI_RICORDATI)) };
}

interface ArchivioTrofei {
  leggi: () => Promise<{ testo: string | null; errore?: string }>;
  scrivi: (testo: string) => Promise<void>;
}
const desktop = (): ArchivioTrofei | undefined =>
  (window as unknown as { viaggiatoreDesktop?: { trofei?: ArchivioTrofei } }).viaggiatoreDesktop?.trofei;

async function leggiDisco(): Promise<Deposito> {
  try {
    const d = desktop();
    const testo = d ? (await d.leggi()).testo : localStorage.getItem(CHIAVE);
    return pulisciDeposito(testo ? JSON.parse(testo) : null);
  } catch {
    return pulisciDeposito(null);   // file illeggibile anche nella riserva, o spazio negato: si riparte da zero
  }
}

// le scritture in fila: vale l'ultima, e nessuna si perde a metà
let coda: Promise<void> = Promise.resolve();
function scriviDisco(d: Deposito): Promise<void> {
  const testo = JSON.stringify({ formato: FORMATO_TROFEI, ...d }, null, 1);
  coda = coda.catch(() => {}).then(async () => {
    const a = desktop();
    if (a) await a.scrivi(testo);
    else localStorage.setItem(CHIAVE, testo);
  });
  return coda;
}

let attuale: Deposito | null = null;
let caricamento: Promise<Deposito> | null = null;
const ascoltatori = new Set<(d: Deposito) => void>();
const avvisa = () => { for (const f of ascoltatori) f(attuale!); };

/** Il deposito: si legge una volta, poi resta in memoria. Chi lo cambia parte da `attuale` DOPO l'attesa, non dal valore
 *  che l'attesa gli ha dato: due cambi partiti insieme (un trofeo vinto e il punto più lontano) si sommano, non si cancellano. */
export function deposito(): Promise<Deposito> {
  if (attuale) return Promise.resolve(attuale);
  caricamento ??= leggiDisco().then((d) => (attuale ??= d));
  return caricamento;
}

/** Il deposito già letto (null se non ancora). */
export const depositoOra = (): Deposito | null => attuale;

/** Segna dei trofei come vinti adesso; restituisce quelli che non lo erano già. */
export async function vinci(ids: string[]): Promise<string[]> {
  await deposito();
  const d = attuale!;
  const nuovi = ids.filter((id) => PER_ID.has(id) && !d.vinti[id]);
  if (!nuovi.length) return [];
  const ora = new Date().toISOString();
  attuale = { ...d, vinti: { ...d.vinti, ...Object.fromEntries(nuovi.map((id) => [id, ora])) } };
  avvisa();
  await scriviDisco(attuale);
  return nuovi;
}

/** Tutti i trofei da vincere di nuovo. I viaggi (il punto più lontano) restano: non sono trofei. */
export async function azzeraTrofei(): Promise<void> {
  await deposito();
  const d = attuale!;
  attuale = { ...d, vinti: {} };
  avvisa();
  await scriviDisco(attuale);
}

/** Il punto più lontano raggiunto da un viaggio (0 se non lo si conosce). */
export const piuLontano = (viaggio: string): number => attuale?.viaggi[viaggio] ?? 0;

/** Segna il punto raggiunto da un viaggio, se è più lontano di quello che si sapeva. Il viaggio va in fondo:
 *  si ricordano i più recenti. */
export async function segnaLontano(viaggio: string, comandi: number): Promise<void> {
  await deposito();
  const d = attuale!;
  if ((d.viaggi[viaggio] ?? -1) >= comandi) return;
  const { [viaggio]: _vecchio, ...altri } = d.viaggi;
  const viaggi = Object.fromEntries([...Object.entries(altri), [viaggio, comandi] as [string, number]].slice(-VIAGGI_RICORDATI));
  attuale = { ...d, viaggi };
  await scriviDisco(attuale);
}

/** Ascolta i cambi (un trofeo vinto, l'azzeramento); restituisce come smettere. */
export function ascoltaTrofei(f: (d: Deposito) => void): () => void {
  ascoltatori.add(f);
  return () => { ascoltatori.delete(f); };
}

/** Un id nuovo per un viaggio che comincia. */
export const nuovoViaggio = (): string => `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
