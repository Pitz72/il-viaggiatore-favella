// ====================================================================
//  La lingua dei testi dell'interfaccia: italiano o inglese.
// --------------------------------------------------------------------
//  I testi dell'interfaccia stanno accanto al codice che li mostra, in
//  coppia: tr("Opzioni", "Options"). La lingua è un'opzione (lib/opzioni.ts):
//  chi mostra un testo si ridisegna al cambio perché ascolta le opzioni
//  (useOpzioni), da sé o da chi lo contiene. Il racconto, che viene dal
//  motore in italiano, lo traduce gioco/traduci.ts.
//  Niente React qui: lo usano anche i moduli senza componenti.
// ====================================================================
import { ascoltaOpzioni, opzioni, type Lingua } from "./opzioni";

export type { Lingua };

/** La lingua di adesso. */
export const lingua = (): Lingua => opzioni().lingua;

/** Si gioca in inglese. */
export const inglese = (): boolean => opzioni().lingua === "en";

/** Il testo nella lingua di adesso. */
export const tr = (it: string, en: string): string => (opzioni().lingua === "en" ? en : it);

/** Un testo in tutte e due le lingue, per le tabelle (i trofei, le schede, le spiegazioni). */
export type Bilingue = { it: string; en: string };
export const in_ = (t: Bilingue): string => t[opzioni().lingua];

/** Il titolo del gioco, così come compare nelle pagine. Per ora uno solo in tutte e due le lingue (il nome
 *  dell'applicazione non cambia: sviluppo/diario, «la lingua inglese»). */
export const TITOLO: Bilingue = { it: "Il Viaggiatore", en: "Il Viaggiatore" };

// La lingua della pagina: il lettore di schermo pronuncia il diario con la voce giusta.
const applica = () => { if (typeof document !== "undefined") document.documentElement.lang = lingua(); };
applica();
ascoltaOpzioni(applica);

// Sul desktop anche il processo principale la sa: i dialoghi del sistema (esporta, apri, la colonna sonora) la seguono.
const alDesktop = () => {
  if (typeof window === "undefined") return;
  (window as unknown as { viaggiatoreDesktop?: { lingua?: (l: string) => void } }).viaggiatoreDesktop?.lingua?.(lingua());
};
alDesktop();
ascoltaOpzioni(alDesktop);
