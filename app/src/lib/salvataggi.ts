// ====================================================================
//  Salvataggi: il formato dei file e dove vivono.
// --------------------------------------------------------------------
//  Un salvataggio è un file JSON leggibile (estensione .viaggiatore):
//    - chi l'ha scritto: versione del gioco, del motore, del formato, commit;
//    - il riassunto per il taccuino (luogo, tappa, turno, corpo, scorte);
//    - la PARTITA: la sequenza effettiva dei comandi + l'impronta dello stato
//      (vedi app/src/lib/ponte.py: caricare = rigiocare e verificare);
//    - il DIARIO, per ritrovare a schermo la pagina com'era;
//    - dalla 1.26, facoltativi: il NOME che gli ha dato chi gioca, una
//      MINIATURA del paesaggio (JPEG) e il TEMPO di gioco. Un file di prima si
//      apre senza; una versione di prima apre un file nuovo e li ignora: il
//      formato resta 1.
//
//  I posti (lib/posti.ts): salvataggi con nome quanti se ne vuole, il rapido,
//  tre automatici a rotazione, e quelli fino alla 1.25 letti come gli altri.
//  Desktop: file veri in Documenti/Il Viaggiatore/Salvataggi (IPC col processo
//  principale, scrittura atomica e copia di riserva). Browser: localStorage,
//  con esportazione/importazione di file.
// ====================================================================
import type { Blocco } from "../gioco/testo";
import type { PartitaSalvata } from "./favellaRuntime";
import { VERSIONE } from "./versione";
import { AUTOMATICI, nomeDi, postoValido, prossimoAutomatico, pulisciNome, type Posto } from "./posti";

export { RAPIDO, AUTOMATICI, genere, nomeDi, nuovoPosto, durataLeggibile, LUNGHEZZA_NOME, type Posto, type Genere } from "./posti";

export const FORMATO = "il-viaggiatore/salvataggio";

export interface VoceSalvata { cmd?: string; blocchi: Blocco[] }

export interface Riassunto {
  luogo: string;
  zona: string;       // chiave z1…z7
  nomeZona: string;
  tappa: number;
  turno: number;
  vita: number; sete: number; fame: number; acqua: number; cibo: number;
}

export interface Salvataggio {
  formato: typeof FORMATO;
  versioneFormato: number;
  gioco: string;
  motore: string;
  commit: string;
  creato: string;     // ISO 8601
  posto: Posto;
  /** il nome che gli ha dato chi gioca (solo i salvataggi con nome) */
  nome?: string;
  /** il paesaggio al momento del salvataggio: data:image/jpeg;base64,… */
  miniatura?: string;
  /** il tempo di gioco della partita, in millisecondi */
  tempoMs?: number;
  riassunto: Riassunto;
  partita: PartitaSalvata;
  diario: { voci: VoceSalvata[]; incontrati: string[]; storia: string[] };
}

export interface VoceTaccuino { posto: Posto; dati: Salvataggio | null; errore?: string }

/** Quante voci del diario entrano nel file (le ultime): la pagina, non l'archivio. */
export const VOCI_NEL_FILE = 160;
/** Una miniatura più grande di così non è una miniatura: si scarta. */
const LIMITE_MINIATURA = 200_000;

/** Il nome che vede chi gioca. */
export const nomeVisibile = (v: { posto: Posto; dati: Salvataggio | null }) => nomeDi(v.posto, v.dati?.nome, v.dati?.riassunto.luogo);

// ── validazione ─────────────────────────────────────────────────────────────
export class SalvataggioNonValido extends Error {}

const BLOCCHI_CON_TESTO = new Set(["prosa", "corpo", "sistema", "finale", "comando"]);

/** Un blocco del diario com'è nel file: i campi che la resa legge devono esserci, altrimenti si scarta. */
function bloccoValido(b: unknown): b is Blocco {
  if (!b || typeof b !== "object") return false;
  const o = b as Record<string, unknown>;
  if (o.tipo === "stanza") return typeof o.titolo === "string";
  if (o.tipo === "battuta") return typeof o.chi === "string" && typeof o.testo === "string";
  return typeof o.tipo === "string" && BLOCCHI_CON_TESTO.has(o.tipo) && typeof o.testo === "string";
}

/** Il diario del file, con un valore di ripiego per ogni pezzo mancante o guasto (il diario è la pagina:
 *  la partita si ricostruisce comunque dai comandi). */
function diarioValido(grezzo: unknown): Salvataggio["diario"] {
  const d = (grezzo && typeof grezzo === "object" ? grezzo : {}) as Record<string, unknown>;
  const stringhe = (x: unknown) => (Array.isArray(x) ? x.filter((v): v is string => typeof v === "string") : []);
  const voci: VoceSalvata[] = (Array.isArray(d.voci) ? d.voci : []).flatMap((v: unknown) => {
    if (!v || typeof v !== "object") return [];
    const { cmd, blocchi } = v as { cmd?: unknown; blocchi?: unknown };
    return [{ ...(typeof cmd === "string" ? { cmd } : {}), blocchi: Array.isArray(blocchi) ? blocchi.filter(bloccoValido) : [] }];
  });
  return { voci, incontrati: stringhe(d.incontrati), storia: stringhe(d.storia) };
}

export function valida(grezzo: unknown): Salvataggio {
  const s = grezzo as Partial<Salvataggio>;
  if (!s || typeof s !== "object" || s.formato !== FORMATO) {
    throw new SalvataggioNonValido("Non è un salvataggio del Viaggiatore.");
  }
  if (typeof s.versioneFormato !== "number" || s.versioneFormato < 1) {
    throw new SalvataggioNonValido("Il file è danneggiato: manca la versione del formato.");
  }
  if (s.versioneFormato > VERSIONE.formatoSalvataggi) {
    throw new SalvataggioNonValido(`Salvato con una versione più recente del gioco (${s.gioco ?? "?"}): aggiorna Il Viaggiatore per aprirlo.`);
  }
  const p = s.partita;
  if (!p || !Array.isArray(p.comandi) || p.comandi.some((c) => typeof c !== "string") || typeof p.impronta !== "string") {
    throw new SalvataggioNonValido("Il file è danneggiato: la partita non è leggibile.");
  }
  if (!s.riassunto || typeof s.riassunto.luogo !== "string") {
    throw new SalvataggioNonValido("Il file è danneggiato: manca il riassunto.");
  }
  // i campi facoltativi della 1.26: un valore guasto si toglie, il salvataggio resta buono
  const nome = pulisciNome(s.nome);
  const miniatura = typeof s.miniatura === "string" && s.miniatura.startsWith("data:image/jpeg;base64,") && s.miniatura.length < LIMITE_MINIATURA ? s.miniatura : undefined;
  const tempoMs = typeof s.tempoMs === "number" && Number.isFinite(s.tempoMs) && s.tempoMs >= 0 ? Math.round(s.tempoMs) : undefined;
  const { nome: _n, miniatura: _m, tempoMs: _t, ...resto } = s;
  return {
    ...resto,
    ...(nome ? { nome } : {}),
    ...(miniatura ? { miniatura } : {}),
    ...(tempoMs !== undefined ? { tempoMs } : {}),
    diario: diarioValido(s.diario),
  } as Salvataggio;
}

export const leggiTesto = (testo: string): Salvataggio => {
  let dati: unknown;
  try { dati = JSON.parse(testo); } catch { throw new SalvataggioNonValido("Il file non è leggibile (JSON non valido)."); }
  return valida(dati);
};

// ── archivio ────────────────────────────────────────────────────────────────
interface ArchivioDesktop {
  elenco: () => Promise<{ posto: string; testo: string | null; errore?: string }[]>;
  leggi: (posto: string) => Promise<{ testo: string | null; errore?: string }>;
  scrivi: (posto: string, testo: string) => Promise<void>;
  elimina: (posto: string) => Promise<void>;
  esporta: (posto: string, nomeSuggerito: string) => Promise<boolean>;
  importa: () => Promise<string | null>;
  cartella: () => Promise<string>;
  apriCartella: () => Promise<void>;
}
const desktop = (): ArchivioDesktop | undefined =>
  (window as unknown as { viaggiatoreDesktop?: { salvataggi?: ArchivioDesktop } }).viaggiatoreDesktop?.salvataggi;

const PREFISSO = "il-viaggiatore/posto/";
const web = {
  posti(): Posto[] {
    const out: Posto[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(PREFISSO) && postoValido(k.slice(PREFISSO.length))) out.push(k.slice(PREFISSO.length));
      }
    } catch { /* niente archivio */ }
    return out;
  },
  leggi(p: Posto): string | null { try { return localStorage.getItem(PREFISSO + p); } catch { return null; } },
  scrivi(p: Posto, t: string) {
    try { localStorage.setItem(PREFISSO + p, t); }
    catch { throw new Error("Il browser non ha più spazio per i salvataggi: eliminane qualcuno, o esportalo in un file."); }
  },
  elimina(p: Posto) { try { localStorage.removeItem(PREFISSO + p); } catch { /* niente */ } },
};

const voce = (posto: Posto, testo: string | null, errore?: string): VoceTaccuino => {
  if (!testo) return { posto, dati: null, errore };
  try { return { posto, dati: leggiTesto(testo) }; }
  catch (e) { return { posto, dati: null, errore: e instanceof Error ? e.message : String(e) }; }
};

/** Tutti i salvataggi che ci sono, dal più recente; quelli illeggibili in fondo. */
export async function elenco(): Promise<VoceTaccuino[]> {
  const d = desktop();
  const voci = d ? (await d.elenco()).map((r) => voce(r.posto, r.testo, r.errore)) : web.posti().map((p) => voce(p, web.leggi(p)));
  return voci.filter((v) => v.dati || v.errore)
    .sort((a, b) => (a.dati && b.dati ? b.dati.creato.localeCompare(a.dati.creato) : a.dati ? -1 : b.dati ? 1 : a.posto.localeCompare(b.posto)));
}

/** Un posto solo (null se non c'è). */
export async function leggi(posto: Posto): Promise<VoceTaccuino | null> {
  const d = desktop();
  const r = d ? await d.leggi(posto) : { testo: web.leggi(posto) };
  const v = voce(posto, r.testo, r.errore);
  return v.dati || v.errore ? v : null;
}

export async function scrivi(posto: Posto, s: Salvataggio): Promise<void> {
  if (!postoValido(posto)) throw new Error(`Posto di salvataggio sconosciuto: ${posto}`);
  const testo = JSON.stringify({ ...s, posto }, null, 1);
  const d = desktop();
  if (d) await d.scrivi(posto, testo);
  else web.scrivi(posto, testo);
}

/** Cambia il nome di un salvataggio: si riscrive il file, il resto (la data compresa) resta com'era. */
export async function rinomina(posto: Posto, s: Salvataggio, nome: string): Promise<Salvataggio> {
  const n = pulisciNome(nome);
  const { nome: _vecchio, ...resto } = s;
  const nuovo: Salvataggio = n ? { ...resto, nome: n } : resto;
  await scrivi(posto, nuovo);
  return nuovo;
}

export async function elimina(posto: Posto): Promise<void> {
  const d = desktop();
  if (d) await d.elimina(posto);
  else web.elimina(posto);
}

export const nomeFile = (s: Salvataggio) =>
  `il-viaggiatore-${(s.nome || s.riassunto.luogo).toLowerCase().replace(/[^a-zà-ù0-9]+/gi, "-").replace(/^-|-$/g, "")}-turno-${s.riassunto.turno}.viaggiatore`;

export async function esporta(posto: Posto, s: Salvataggio): Promise<boolean> {
  const d = desktop();
  if (d) return d.esporta(posto, nomeFile(s));
  const blob = new Blob([JSON.stringify(s, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nomeFile(s);
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return true;
}

/** Sceglie un file e lo restituisce validato (null se l'utente annulla). */
export async function importa(): Promise<Salvataggio | null> {
  const d = desktop();
  if (d) {
    const testo = await d.importa();
    return testo === null ? null : leggiTesto(testo);
  }
  return new Promise((risolvi, rifiuta) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".viaggiatore,.json,application/json";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return risolvi(null);
      try { risolvi(leggiTesto(await f.text())); } catch (e) { rifiuta(e); }
    };
    input.click();
  });
}

export const cartella = async (): Promise<string | null> => (desktop() ? desktop()!.cartella() : null);
export const apriCartella = async () => { await desktop()?.apriCartella(); };
export const archivioSuDisco = () => !!desktop();

/** Il salvataggio più recente fra tutti i posti, rapido e automatici compresi. */
export async function piuRecente(): Promise<Salvataggio | null> {
  return (await elenco()).find((v) => v.dati)?.dati ?? null;
}

// ── i tre automatici ─────────────────────────────────────────────────────────
// Si riscrive sempre quello dopo l'ultimo scritto, cioè il più vecchio. L'indice dell'ultimo sta nel browser
// dell'app; se non c'è (prima volta, o spazio cancellato) lo si ricava dai file: il più recente dei tre.
const CHIAVE_GIRO = "viaggiatore.automatico";
let ultimoGiro: number | null | undefined;

export async function postoAutomatico(): Promise<Posto> {
  if (ultimoGiro === undefined) {
    let letto: number | null = null;
    try { const n = Number(localStorage.getItem(CHIAVE_GIRO)); letto = localStorage.getItem(CHIAVE_GIRO) !== null && Number.isInteger(n) ? n : null; } catch { /* niente */ }
    if (letto === null) {
      const piuNuovo = (await elenco()).find((v) => v.dati && AUTOMATICI.includes(v.posto));
      letto = piuNuovo ? AUTOMATICI.indexOf(piuNuovo.posto) : null;
    }
    ultimoGiro = letto;
  }
  const i = prossimoAutomatico(ultimoGiro);
  ultimoGiro = i;
  try { localStorage.setItem(CHIAVE_GIRO, String(i)); } catch { /* niente spazio: si ricava dai file la prossima volta */ }
  return AUTOMATICI[i];
}

// ── composizione di un salvataggio ──────────────────────────────────────────
export function componi(posto: Posto, partita: PartitaSalvata, riassunto: Riassunto,
  diario: Salvataggio["diario"], extra: { nome?: string; miniatura?: string; tempoMs?: number } = {}): Salvataggio {
  const nome = pulisciNome(extra.nome);
  return {
    formato: FORMATO,
    versioneFormato: VERSIONE.formatoSalvataggi,
    gioco: VERSIONE.gioco,
    motore: partita.motore,
    commit: VERSIONE.commit,
    creato: new Date().toISOString(),
    posto,
    ...(nome ? { nome } : {}),
    ...(extra.miniatura ? { miniatura: extra.miniatura } : {}),
    ...(extra.tempoMs !== undefined ? { tempoMs: Math.round(extra.tempoMs) } : {}),
    riassunto,
    partita,
    diario: { ...diario, voci: diario.voci.slice(-VOCI_NEL_FILE) },
  };
}

const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
export function dataLeggibile(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}
