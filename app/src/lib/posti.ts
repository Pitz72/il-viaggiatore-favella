// ====================================================================
//  I posti dei salvataggi (piano 09, §6): come si chiamano, di che genere
//  sono, come si mostrano. Niente import: il collaudo lo prova in Node
//  (app/scripts/posti-node.mjs).
// --------------------------------------------------------------------
//  Un «posto» è il nome del file senza estensione (sul desktop) o la coda
//  della chiave (nel browser):
//    s-AAAAMMGG-HHMMSS-xxxx   un salvataggio con nome, quanti se ne vuole
//    rapido                   il rapido (F5 lo scrive, F9 lo ricarica)
//    automatico-1/2/3         i tre automatici, a rotazione
//  e quelli fino alla 1.25, che si leggono come gli altri: «automatico» e
//  «posto-1» … «posto-6» sul desktop, «auto» e «1» … «6» nel browser.
//  desktop/salvataggi.cjs ha lo stesso elenco (POSTO): la pagina non può
//  chiedergli altri nomi.
// ====================================================================

export type Posto = string;
export type Genere = "rapido" | "automatico" | "manuale";

export const RAPIDO: Posto = "rapido";
export const AUTOMATICI: readonly Posto[] = ["automatico-1", "automatico-2", "automatico-3"];
const VECCHI_AUTOMATICI: readonly Posto[] = ["automatico", "auto"];
const VECCHIO_MANUALE = /^(?:posto-)?([1-6])$/;
const CON_NOME = /^s-\d{8}-\d{6}-[0-9a-z]{4}$/;
/** Il nome di un salvataggio: corto, su una riga. */
export const LUNGHEZZA_NOME = 60;

export function genere(p: Posto): Genere {
  if (p === RAPIDO) return "rapido";
  if (AUTOMATICI.includes(p) || VECCHI_AUTOMATICI.includes(p)) return "automatico";
  return "manuale";
}

export const postoValido = (p: unknown): p is Posto =>
  typeof p === "string" && (p === RAPIDO || AUTOMATICI.includes(p) || VECCHI_AUTOMATICI.includes(p) || VECCHIO_MANUALE.test(p) || CON_NOME.test(p));

/** Un posto nuovo per un salvataggio con nome: l'istante, più quattro caratteri a caso (due salvataggi nello stesso secondo). */
export function nuovoPosto(ora = new Date(), caso: () => number = Math.random): Posto {
  const d = (n: number, l = 2) => String(n).padStart(l, "0");
  const coda = Array.from({ length: 4 }, () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(caso() * 36) % 36]).join("");
  return `s-${d(ora.getFullYear(), 4)}${d(ora.getMonth() + 1)}${d(ora.getDate())}-${d(ora.getHours())}${d(ora.getMinutes())}${d(ora.getSeconds())}-${coda}`;
}

/** Un nome ripulito: una riga, senza spazi in più, al massimo LUNGHEZZA_NOME caratteri; vuoto se non resta niente. */
export const pulisciNome = (nome: unknown): string =>
  typeof nome === "string" ? nome.replace(/\s+/g, " ").trim().slice(0, LUNGHEZZA_NOME).trim() : "";

/** Come si chiama, per chi gioca, il salvataggio di un posto. */
export function nomeDi(posto: Posto, nome?: string, luogo?: string): string {
  const n = pulisciNome(nome);
  if (n) return n;
  const g = genere(posto);
  if (g === "rapido") return "Salvataggio rapido";
  if (g === "automatico") return "Salvataggio automatico";
  const m = VECCHIO_MANUALE.exec(posto);
  if (m) return `Posto ${m[1]}`;
  return luogo || "Salvataggio";
}

/** Il prossimo dei tre automatici: dopo quello scritto per ultimo (l'indice, se si sa), cioè il più vecchio. */
export function prossimoAutomatico(ultimo: number | null): number {
  return ultimo === null || !Number.isInteger(ultimo) || ultimo < 0 || ultimo >= AUTOMATICI.length ? 0 : (ultimo + 1) % AUTOMATICI.length;
}

/** Il tempo di gioco, a parole brevi: «meno di un minuto», «14 min», «2 h 05 min». */
export function durataLeggibile(ms: number | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) return "—";
  const minuti = Math.floor(ms / 60000);
  if (minuti < 1) return "meno di un minuto";
  if (minuti < 60) return `${minuti} min`;
  return `${Math.floor(minuti / 60)} h ${String(minuti % 60).padStart(2, "0")} min`;
}
