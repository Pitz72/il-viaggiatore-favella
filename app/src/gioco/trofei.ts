// ====================================================================
//  I trofei: il catalogo e le regole (pre-produzione/09-opzioni-menu-pausa.md, §7).
// --------------------------------------------------------------------
//  Funzioni pure, come azioni.ts: niente React, niente disco, niente import
//  di runtime. Così il collaudo (collaudo/trofei.py, attraverso
//  app/scripts/trofei-node.mjs) prova questa logica, non una sua copia.
//
//  Le regole leggono un turno: il testo che il motore ha scritto, l'esito
//  della partita, e ciò che il ponte espone (ponte.py, fav_stato): i
//  contatori, le voci, i gesti, gli stati della storia. In più le SFIDE della
//  partita: se ha mai scritto un comando, se ha mai toccato un pulsante, se è
//  mai tornata indietro (vedi `Sfide`). Un trofeo si vince una volta sola;
//  chi chiama passa quelli già vinti, e riceve soltanto i nuovi.
//
//  Nomi e accenni sono quelli rivisti con Simone il 21/10/2026 (§7.3).
//  L'accenno è ciò che si legge prima di vincerlo; la frase, dopo.
// ====================================================================

export type Famiglia = "finali" | "fini" | "gesti" | "modi" | "sfide" | "collezione";

export interface Trofeo {
  id: string;
  famiglia: Famiglia;
  nome: string;
  /** prima di vincerlo: dove guardare, non che cosa fare */
  accenno: string;
  /** dopo: che cosa hai fatto, detto a chi gioca */
  frase: string;
}

export const FAMIGLIE: readonly { id: Famiglia; titolo: string }[] = [
  { id: "finali", titolo: "I finali" },
  { id: "fini", titolo: "Lungo la strada" },
  { id: "gesti", titolo: "I gesti" },
  { id: "modi", titolo: "I modi di arrivare" },
  { id: "sfide", titolo: "Le sfide" },
  { id: "collezione", titolo: "La collezione" },
];

const T = (famiglia: Famiglia, id: string, nome: string, accenno: string, frase: string): Trofeo => ({ id, famiglia, nome, accenno, frase });

export const TROFEI: readonly Trofeo[] = [
  // i sei finali della storia
  T("finali", "qualcuno-lo-porti-via", "Qualcuno lo porti via", "Un finale: non da solo", "Hai lasciato la casa a Cosimo e sei ripartito con Peppe accanto."),
  T("finali", "il-cavallo-di-legno", "Il cavallo di legno", "Un finale: qualcosa da posare", "Hai posato il cavallo di legno sulla croce più piccola."),
  T("finali", "quello-che-era-suo", "Quello che era suo", "Un finale: qualcosa da restituire", "Hai infilato la fede di lei nel nodo della croce più grande."),
  T("finali", "le-mani-vuote", "Le mani vuote", "Un finale: senza niente in mano", "Sei arrivato a casa senza niente di loro da posarci."),
  T("finali", "sopra-il-corpo", "Sopra il corpo", "Un finale, al guado", "Al guado hai sparato a Cosimo, e la casa è rimasta a te."),
  T("finali", "nessuno-da-chiamare", "Nessuno da chiamare", "Un finale, al guado, dopo uno sparo", "Hai sparato a Cosimo davanti a Peppe, e Peppe è corso via."),
  // le tre fini lungo la strada
  T("fini", "i-sassi-che-scottano", "I sassi che scottano", "Lungo la strada", "La sete ti ha fermato prima di casa."),
  T("fini", "senza-la-forza", "Senza la forza", "Lungo la strada", "La fame ti ha fermato lungo la strada."),
  T("fini", "il-viaggio-finisce-qui", "Il viaggio finisce qui", "Lungo la strada", "Le ferite ti hanno fermato lungo la strada."),
  // i dieci gesti: gli stessi «che cosa hai fatto a chi» della barra laterale
  T("gesti", "senza-un-grazie", "Senza un grazie", "Qualcuno al pozzo", "Hai lasciato da mangiare a Saverio, al pozzo."),
  T("gesti", "qualcosa-del-tuo", "Qualcosa del tuo", "Qualcuno alla diga", "Hai lasciato qualcosa del tuo a Iole, alla diga."),
  T("gesti", "si-beve-non-si-ama", "Si beve, non si ama", "Qualcosa alla diga", "Hai legato il filtro alla pompa della diga."),
  T("gesti", "affare-fatto", "Affare fatto", "Qualcuno al casello", "Hai pagato a Vito il passaggio del casello."),
  T("gesti", "la-pistola-scarica", "La pistola scarica", "Qualcuno al casello", "Hai puntato a Vito una pistola scarica, e lui ha alzato la sbarra."),
  T("gesti", "contro-la-sbarra", "Contro la sbarra", "Qualcuno al casello", "Hai lasciato Vito a terra, contro la sbarra."),
  T("gesti", "per-chi-passera-dopo", "Per chi passerà dopo", "Qualcuno in osteria", "Hai lasciato dell'acqua a Rosaria, per chi passerà dopo di te."),
  T("gesti", "qualcosa-di-quella-casa", "Qualcosa di quella casa", "Qualcuno sulle colline", "Hai mostrato a Onofrio qualcosa di quella casa."),
  T("gesti", "la-scarpa-allacciata", "La scarpa allacciata", "Qualcuno sulla discesa", "Hai dato da mangiare a Imma, sulla discesa."),
  T("gesti", "la-febbre-rotta", "La febbre rotta", "Qualcuno nel vicolo", "Hai curato Pasquale con le tue medicine."),
  // i sei modi di arrivare
  T("modi", "mani-pulite", "Mani pulite", "Arrivare in un certo modo", "Sei arrivato a casa senza sangue sulle mani."),
  T("modi", "la-lettera", "La lettera", "Al guado, una via", "Al guado Cosimo ha riconosciuto la sua lettera, e si è fatto da parte."),
  T("modi", "il-fucile-posato", "Il fucile posato", "Al guado, un'altra via", "Al guado hai posato il fucile, e Cosimo si è fatto da parte."),
  T("modi", "chi-arrivava-di-la", "Chi arrivava di là", "Al guado, la via più lunga", "Al guado sei rimasto fermo con Cosimo, finché si è fatto da parte."),
  T("modi", "quello-che-lasciava-l-acqua", "Quello che lasciava l'acqua", "Quello che si dice di te", "La voce di ciò che lasciavi per strada è arrivata prima di te."),
  T("modi", "detto-il-vero", "Detto il vero", "Una domanda di Peppe", "A Peppe che ti chiedeva del sangue hai detto la verità."),
  // le tre sfide, ciascuna su un finale della storia
  T("sfide", "senza-voltarti", "Senza voltarti", "Una sfida", "Sei arrivato a un finale senza mai tornare indietro."),
  T("sfide", "tutto-a-parole", "Tutto a parole", "Una sfida", "Sei arrivato a un finale scrivendo ogni comando."),
  T("sfide", "tutto-a-pulsanti", "Tutto a pulsanti", "Una sfida", "Sei arrivato a un finale coi soli pulsanti."),
  // la collezione
  T("collezione", "tutte-le-strade", "Tutte le strade", "Tutti i finali", "Hai visto i sei finali della storia."),
  T("collezione", "il-viaggiatore", "Il viaggiatore", "Tutto", "Hai vinto tutti gli altri trofei."),
];

export const PER_ID: ReadonlyMap<string, Trofeo> = new Map(TROFEI.map((t) => [t.id, t]));

// ── le sfide della partita ───────────────────────────────────────────────────
/** Le sfide di una partita, che viaggiano nei salvataggi (campo `sfide`): continuare un viaggio non le rompe,
 *  tornare indietro sì. `id` riconosce la partita da un salvataggio all'altro (il punto più lontano raggiunto
 *  sta nel deposito dei trofei, lib/trofei.ts). */
export interface Sfide {
  id: string;
  /** almeno un comando scritto nella riga */
  scritto: boolean;
  /** almeno un comando dato con un pulsante */
  toccato: boolean;
  /** è tornata indietro: un ANNULLA, o il caricamento di un punto prima del più lontano raggiunto */
  indietro: boolean;
}

/** Un viaggio che comincia: nessuna sfida rotta. */
export const sfideNuove = (id: string): Sfide => ({ id, scritto: false, toccato: false, indietro: false });

/** Le sfide lette da un salvataggio. Un salvataggio senza (fino alla 1.29) o guasto: tutte rotte, perché di quella
 *  partita non si sa com'è andata (i trofei contano da questa versione in poi). */
export function pulisciSfide(x: unknown, idDiRiserva: string): Sfide {
  const d = (x && typeof x === "object" ? x : null) as Record<string, unknown> | null;
  if (!d || typeof d.id !== "string" || !/^[0-9a-z-]{4,40}$/.test(d.id)) return { id: idDiRiserva, scritto: true, toccato: true, indietro: true };
  const b = (v: unknown) => (typeof v === "boolean" ? v : true);
  return { id: d.id, scritto: b(d.scritto), toccato: b(d.toccato), indietro: b(d.indietro) };
}

/** Le sfide di un salvataggio che si carica. Tornare a un punto (quanti comandi) prima del più lontano che quel viaggio
 *  ha raggiunto è tornare indietro: «Senza voltarti» cade. `lontano` dice il punto più lontano noto di un viaggio. */
export function sfideCaricate(salvate: unknown, comandi: number, lontano: (viaggio: string) => number, idDiRiserva: string): Sfide {
  const s = pulisciSfide(salvate, idDiRiserva);
  return lontano(s.id) > comandi ? { ...s, indietro: true } : s;
}

// ── le regole ────────────────────────────────────────────────────────────────
/** Un turno, come lo vedono le regole. */
export interface Turno {
  /** il testo del turno, com'è uscito dal motore */
  testo: string;
  /** l'esito della partita dopo il turno: in_corso, vinta, persa, terminata */
  esito: string;
  counters: Record<string, number>;
  voci?: string[];
  gesti?: Record<string, string[]>;
  /** gli stati della storia (ponte.py, fav_stato): «stato di cosimo» → «riconosciuto»… */
  stati?: Record<string, string>;
  sfide: Sfide;
}

/** Le sei righe «FINALE —» della storia (prototipo/z7-guado.fav), da una frase che ciascuna ha e le altre no. */
export const FINALI: readonly [string, string][] = [
  ["lo porti via vivo", "qualcuno-lo-porti-via"],
  ["l'ultima cosa che restava da riportare", "il-cavallo-di-legno"],
  ["le hai riportato quello che era suo", "quello-che-era-suo"],
  ["con le mani vuote", "le-mani-vuote"],
  ["sopra il corpo di tuo fratello", "sopra-il-corpo"],
  ["Il ragazzo che ti seguiva", "nessuno-da-chiamare"],
];
/** Le tre fini lungo la strada (prototipo/sistemi.fav, «perdi»). */
export const FINI: readonly [string, string][] = [
  ["La sete ti ha avuto prima di casa", "i-sassi-che-scottano"],
  ["La fame ti ha fermato lungo la strada", "senza-la-forza"],
  ["Il viaggio finisce qui", "il-viaggio-finisce-qui"],
];
/** I gesti del ponte (ponte.py, _GESTI), «persona:gesto». */
export const GESTI_TROFEI: Readonly<Record<string, string>> = {
  "Saverio:cibo": "senza-un-grazie",
  "Iole:dono": "qualcosa-del-tuo",
  "Iole:pompa": "si-beve-non-si-ama",
  "Vito:pagato": "affare-fatto",
  "Vito:bluff": "la-pistola-scarica",
  "Vito:terra": "contro-la-sbarra",
  "Rosaria:acqua": "per-chi-passera-dopo",
  "Onofrio:ricordo": "qualcosa-di-quella-casa",
  "Imma:cibo": "la-scarpa-allacciata",
  "Pasquale:cura": "la-febbre-rotta",
};
/** Le tre vie del riconoscimento al guado (lo stato del riconoscimento, z7-guado.fav). */
const RICONOSCIMENTO: Readonly<Record<string, string>> = { lettera: "la-lettera", fucile: "il-fucile-posato", veglia: "chi-arrivava-di-la" };

const SEI_FINALI = FINALI.map(([, id]) => id);
const TUTTI_GLI_ALTRI = TROFEI.map((t) => t.id).filter((id) => id !== "il-viaggiatore");

/** Il finale della storia raggiunto in questo turno (l'id del suo trofeo), o null. */
export function finaleDelTurno(testo: string): string | null {
  const riga = testo.split("\n").find((r) => /^\s*FINALE\s*—/.test(r));
  if (!riga) return null;
  return FINALI.find(([frase]) => riga.includes(frase))?.[1] ?? null;
}

/** I trofei che questo turno fa vincere, fra quelli non ancora vinti; nell'ordine del catalogo. */
export function trofeiDelTurno(t: Turno, vinti: ReadonlySet<string>): string[] {
  const presi = new Set<string>();
  const prendi = (id: string | null | undefined) => { if (id && !vinti.has(id)) presi.add(id); };
  const stati = t.stati ?? {};

  // un finale della storia: il suo trofeo, i modi di arrivare che valgono solo lì, le sfide
  const finale = finaleDelTurno(t.testo);
  if (finale) {
    prendi(finale);
    // senza sangue e senza aver sparato al fratello (abbattere Cosimo non aumenta il contatore del sangue)
    if ((t.counters.sangue ?? 0) <= 0 && stati["stato di cosimo"] !== "abbattuto") prendi("mani-pulite");
    if (!t.sfide.indietro) prendi("senza-voltarti");
    if (t.sfide.scritto && !t.sfide.toccato) prendi("tutto-a-parole");
    if (t.sfide.toccato && !t.sfide.scritto) prendi("tutto-a-pulsanti");
  }
  // una fine lungo la strada
  if (t.esito === "persa") prendi(FINI.find(([frase]) => t.testo.includes(frase))?.[1]);
  // i gesti, appena compaiono a lato dello schermo
  for (const [chi, gesti] of Object.entries(t.gesti ?? {})) for (const g of gesti) prendi(GESTI_TROFEI[`${chi}:${g}`]);
  // il guado, la voce, Peppe
  prendi(RICONOSCIMENTO[stati["stato del riconoscimento"] ?? ""]);
  if ((t.voci ?? []).includes("della generosità")) prendi("quello-che-lasciava-l-acqua");
  if (stati["stato del sapere di peppe"] === "vero") prendi("detto-il-vero");

  // la collezione: contano anche quelli presi adesso
  const ha = (id: string) => vinti.has(id) || presi.has(id);
  if (SEI_FINALI.every(ha)) prendi("tutte-le-strade");
  if (TUTTI_GLI_ALTRI.every(ha)) prendi("il-viaggiatore");

  return TROFEI.map((x) => x.id).filter((id) => presi.has(id));
}
