// ====================================================================
//  SCALETTA della sequenza finale — i tempi, in secondi dall'inizio.
// --------------------------------------------------------------------
//  Piano: pre-produzione/11-sequenza-finale.md, §2. La durata è quella della
//  canzone (public/musica/finale.opus; finché non c'è, intro.mp3), mai sotto
//  MINIMO: Simone ha chiesto almeno 1:20. L'inizio ha tempi fissi (il
//  tramonto, la frase del finale, la notte, il titolo); la fine conta a
//  ritroso dalla durata (i due loghi, il nero), così i titoli di coda si
//  allungano o si accorciano con la canzone e i loghi cadono sempre sulla sua
//  coda strumentale.
//  Niente React né import: lo prova app/scripts/finale-node.mjs.
// ====================================================================

/** La sequenza dura almeno così (s). */
export const MINIMO = 90;
/** Quando parte la canzone (s). */
export const ATTACCO = 0.5;
/** Le durate dei loghi di apertura (loghi/LogoRuntime.tsx, loghi/LogoFavella.tsx): la prova le confronta. */
export const DURATA_RUNTIME = 5.6;
export const DURATA_FAVELLA = 6.8;

export interface Tempi {
  durata: number;
  /** il tramonto esce dal nero */
  scenaDa: number; scenaA: number;
  /** le bande nere si richiudono */
  bandeDa: number; bandeA: number;
  /** la frase del finale (le dissolvenze stanno dentro) */
  fraseDa: number; fraseA: number;
  /** scende la notte */
  notteDa: number; notteA: number;
  /** i titoli: il titolo fermo al centro, poi la colonna sale; finisce dove comincia il nero */
  titoliDa: number; titoloFermoA: number; titoliA: number;
  /** il quadro torna nero, poi i due loghi si ricompongono */
  neroDa: number; runtimeDa: number; favellaDa: number;
}

export function tempi(durataCanzone: number | null): Tempi {
  const durata = Math.max(MINIMO, (durataCanzone ?? 0) + ATTACCO + 1);
  const favellaDa = durata - 1 - DURATA_FAVELLA;
  const runtimeDa = favellaDa - DURATA_RUNTIME;
  const neroDa = runtimeDa - 1;
  return {
    durata,
    scenaDa: 1.5, scenaA: 4,
    bandeDa: 2, bandeA: 5,
    fraseDa: 6, fraseA: 20,
    notteDa: 18, notteA: 30,
    titoliDa: 26, titoloFermoA: 33, titoliA: neroDa,
    neroDa, runtimeDa, favellaDa,
  };
}

/** 0 fuori da [da, a], 1 dentro, con le rampe d'entrata e d'uscita (s). */
export function presenza(t: number, da: number, a: number, entra: number, esce: number) {
  if (t <= da || t >= a) return 0;
  return Math.min(1, entra > 0 ? (t - da) / entra : 1, esce > 0 ? (a - t) / esce : 1);
}
