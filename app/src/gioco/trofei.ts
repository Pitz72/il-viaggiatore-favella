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
//  Ogni testo c'è nelle due lingue: `nome`, `accenno` e `frase` sono
//  l'italiano (quello che leggono i collaudi), `en` l'inglese. Quale mostrare
//  lo sceglie chi mostra, con la lingua di adesso (testiTrofeo, titoloFamiglia).
//  Due sfide sono di una lingua sola (SOLO_IN): «Tutto a parole» vuole il
//  parser, che capisce l'italiano; in inglese, dove si gioca coi pulsanti, al
//  suo posto c'è «Parola per parola» (ogni strada che il testo nomina, presa dal
//  testo). Ogni lingua ne mostra trenta (trofeiDellaLingua), e per la
//  collezione l'una vale l'altra.
// ====================================================================

export type Famiglia = "finali" | "fini" | "gesti" | "modi" | "sfide" | "collezione";

/** I testi di un trofeo, in una lingua. */
export interface TestiTrofeo {
  nome: string;
  /** prima di vincerlo: dove guardare, non che cosa fare */
  accenno: string;
  /** dopo: che cosa hai fatto, detto a chi gioca */
  frase: string;
}

/** Un trofeo: i campi di TestiTrofeo sono in italiano, `en` li ha in inglese. */
export interface Trofeo extends TestiTrofeo {
  id: string;
  famiglia: Famiglia;
  en: TestiTrofeo;
}

export const FAMIGLIE: readonly { id: Famiglia; titolo: string; en: { titolo: string } }[] = [
  { id: "finali", titolo: "I finali", en: { titolo: "The endings" } },
  { id: "fini", titolo: "Lungo la strada", en: { titolo: "Along the road" } },
  { id: "gesti", titolo: "I gesti", en: { titolo: "Deeds" } },
  { id: "modi", titolo: "I modi di arrivare", en: { titolo: "Ways of arriving" } },
  { id: "sfide", titolo: "Le sfide", en: { titolo: "The challenges" } },
  { id: "collezione", titolo: "La collezione", en: { titolo: "The collection" } },
];

const T = (famiglia: Famiglia, id: string, nome: string, accenno: string, frase: string, [nomeEn, accennoEn, fraseEn]: [string, string, string]): Trofeo =>
  ({ id, famiglia, nome, accenno, frase, en: { nome: nomeEn, accenno: accennoEn, frase: fraseEn } });

export const TROFEI: readonly Trofeo[] = [
  // i sei finali della storia
  T("finali", "qualcuno-lo-porti-via", "Qualcuno lo porti via", "Un finale: non da solo", "Hai lasciato la casa a Cosimo e sei ripartito con Peppe accanto.",
    ["Someone you take away", "An ending: not alone", "You left the house to Cosimo and set off again with Peppe beside you."]),
  T("finali", "il-cavallo-di-legno", "Il cavallo di legno", "Un finale: qualcosa da posare", "Hai posato il cavallo di legno sulla croce più piccola.",
    ["The wooden horse", "An ending: something to lay down", "You set the wooden horse on the smaller cross."]),
  T("finali", "quello-che-era-suo", "Quello che era suo", "Un finale: qualcosa da restituire", "Hai infilato la fede di lei nel nodo della croce più grande.",
    ["What was hers", "An ending: something to give back", "You slipped her wedding ring into the knot of the larger cross."]),
  T("finali", "le-mani-vuote", "Le mani vuote", "Un finale: senza niente in mano", "Sei arrivato a casa senza niente di loro da posarci.",
    ["Empty-handed", "An ending: with nothing in your hands", "You came home with nothing of theirs to lay there."]),
  T("finali", "sopra-il-corpo", "Sopra il corpo", "Un finale, al guado", "Al guado hai sparato a Cosimo, e la casa è rimasta a te.",
    ["Over the body", "An ending, at the ford", "At the ford you shot Cosimo, and the house was left to you."]),
  T("finali", "nessuno-da-chiamare", "Nessuno da chiamare", "Un finale, al guado, dopo uno sparo", "Hai sparato a Cosimo davanti a Peppe, e Peppe è corso via.",
    ["No one to call", "An ending, at the ford, after a shot", "You shot Cosimo in front of Peppe, and Peppe ran away."]),
  // le tre fini lungo la strada
  T("fini", "i-sassi-che-scottano", "I sassi che scottano", "Lungo la strada", "La sete ti ha fermato prima di casa.",
    ["Scorching stones", "Along the road", "Thirst stopped you before home."]),
  T("fini", "senza-la-forza", "Senza la forza", "Lungo la strada", "La fame ti ha fermato lungo la strada.",
    ["Without the strength", "Along the road", "Hunger stopped you on the road."]),
  T("fini", "il-viaggio-finisce-qui", "Il viaggio finisce qui", "Lungo la strada", "Le ferite ti hanno fermato lungo la strada.",
    ["The journey ends here", "Along the road", "Your wounds stopped you on the road."]),
  // i dieci gesti: gli stessi «che cosa hai fatto a chi» della barra laterale
  T("gesti", "senza-un-grazie", "Senza un grazie", "Qualcuno al pozzo", "Hai lasciato da mangiare a Saverio, al pozzo.",
    ["Without a thank-you", "Someone at the well", "You left Saverio something to eat, at the well."]),
  T("gesti", "qualcosa-del-tuo", "Qualcosa del tuo", "Qualcuno alla diga", "Hai lasciato qualcosa del tuo a Iole, alla diga.",
    ["Something of yours", "Someone at the dam", "You left Iole something of yours, at the dam."]),
  T("gesti", "si-beve-non-si-ama", "Si beve, non si ama", "Qualcosa alla diga", "Hai legato il filtro alla pompa della diga.",
    ["You drink it, you don't love it", "Something at the dam", "You tied the filter to the pump at the dam."]),
  T("gesti", "affare-fatto", "Affare fatto", "Qualcuno al casello", "Hai pagato a Vito il passaggio del casello.",
    ["It's a deal", "Someone at the tollbooth", "You paid Vito to get through the tollbooth."]),
  T("gesti", "la-pistola-scarica", "La pistola scarica", "Qualcuno al casello", "Hai puntato a Vito una pistola scarica, e lui ha alzato la sbarra.",
    ["The empty gun", "Someone at the tollbooth", "You pointed an empty pistol at Vito, and he lifted the barrier."]),
  T("gesti", "contro-la-sbarra", "Contro la sbarra", "Qualcuno al casello", "Hai lasciato Vito a terra, contro la sbarra.",
    ["Against the barrier", "Someone at the tollbooth", "You left Vito on the ground, against the barrier."]),
  T("gesti", "per-chi-passera-dopo", "Per chi passerà dopo", "Qualcuno in osteria", "Hai lasciato dell'acqua a Rosaria, per chi passerà dopo di te.",
    ["For whoever comes after", "Someone at the tavern", "You left Rosaria some water, for whoever comes by after you."]),
  T("gesti", "qualcosa-di-quella-casa", "Qualcosa di quella casa", "Qualcuno sulle colline", "Hai mostrato a Onofrio qualcosa di quella casa.",
    ["Something from that house", "Someone in the hills", "You showed Onofrio something from that house."]),
  T("gesti", "la-scarpa-allacciata", "La scarpa allacciata", "Qualcuno sulla discesa", "Hai dato da mangiare a Imma, sulla discesa.",
    ["The shoe tied", "Someone on the descent", "You gave Imma something to eat, on the descent."]),
  T("gesti", "la-febbre-rotta", "La febbre rotta", "Qualcuno nel vicolo", "Hai curato Pasquale con le tue medicine.",
    ["The fever broken", "Someone in the alley", "You treated Pasquale with your medicine."]),
  // i sei modi di arrivare
  T("modi", "mani-pulite", "Mani pulite", "Arrivare in un certo modo", "Sei arrivato a casa senza sangue sulle mani.",
    ["Clean hands", "Arriving a certain way", "You came home with no blood on your hands."]),
  T("modi", "la-lettera", "La lettera", "Al guado, una via", "Al guado Cosimo ha riconosciuto la sua lettera, e si è fatto da parte.",
    ["The letter", "At the ford, one way", "At the ford Cosimo recognised his letter, and stepped aside."]),
  T("modi", "il-fucile-posato", "Il fucile posato", "Al guado, un'altra via", "Al guado hai posato il fucile, e Cosimo si è fatto da parte.",
    ["The shotgun laid down", "At the ford, another way", "At the ford you laid down the shotgun, and Cosimo stepped aside."]),
  T("modi", "chi-arrivava-di-la", "Chi arrivava di là", "Al guado, la via più lunga", "Al guado sei rimasto fermo con Cosimo, finché si è fatto da parte.",
    ["Who'd reach the other side", "At the ford, the longest way", "At the ford you kept still with Cosimo, until he stepped aside."]),
  T("modi", "quello-che-lasciava-l-acqua", "Quello che lasciava l'acqua", "Quello che si dice di te", "La voce di ciò che lasciavi per strada è arrivata prima di te.",
    ["The one who left water", "What they say about you", "Word of what you left along the road got there before you."]),
  T("modi", "detto-il-vero", "Detto il vero", "Una domanda di Peppe", "A Peppe che ti chiedeva del sangue hai detto la verità.",
    ["The truth told", "A question from Peppe", "When Peppe asked you about the blood, you told him the truth."]),
  // le tre sfide, ciascuna su un finale della storia
  T("sfide", "senza-voltarti", "Senza voltarti", "Una sfida", "Sei arrivato a un finale senza mai tornare indietro.",
    ["Without looking back", "A challenge", "You reached an ending without ever going back."]),
  T("sfide", "tutto-a-parole", "Tutto a parole", "Una sfida", "Sei arrivato a un finale scrivendo ogni comando.",
    ["All in words", "A challenge", "You reached an ending typing every command."]),
  T("sfide", "tutto-a-pulsanti", "Tutto a pulsanti", "Una sfida", "Sei arrivato a un finale coi soli pulsanti.",
    ["All by buttons", "A challenge", "You reached an ending with the buttons alone."]),
  // solo in inglese: il posto di «Tutto a parole», che vuole il parser italiano
  T("sfide", "parola-per-parola", "Parola per parola", "Una sfida, solo in inglese",
    "Sei arrivato a un finale in inglese, prendendo dal testo ogni strada che il testo nominava.",
    ["Word by Word", "A challenge, in English only", "You reached an ending in English, taking from the text every way the text named."]),
  // la collezione
  T("collezione", "tutte-le-strade", "Tutte le strade", "Tutti i finali", "Hai visto i sei finali della storia.",
    ["All the roads", "All the endings", "You have seen all six endings of the story."]),
  T("collezione", "il-viaggiatore", "Il viaggiatore", "Tutto", "Hai vinto tutti gli altri trofei.",
    // il nome del gioco non si traduce (Simone, 30/10/2026): nemmeno quello del trofeo che lo ripete
    ["Il viaggiatore", "Everything", "You have won every other trophy."]),
];

/** I testi di un trofeo nella lingua data. Qui niente import: chi mostra passa la lingua di adesso (lib/lingua.ts, lingua()). */
export const testiTrofeo = (t: Trofeo, lingua: "it" | "en"): TestiTrofeo => (lingua === "en" ? t.en : t);

/** Il titolo di una famiglia nella lingua data. */
export const titoloFamiglia = (f: Famiglia, lingua: "it" | "en"): string => {
  const x = FAMIGLIE.find((y) => y.id === f);
  return x ? (lingua === "en" ? x.en.titolo : x.titolo) : f;
};

export const PER_ID: ReadonlyMap<string, Trofeo> = new Map(TROFEI.map((t) => [t.id, t]));

/** Le sfide di una lingua sola: «Tutto a parole» vuole il parser (italiano), «Parola per parola» è il suo posto in inglese. */
export const SOLO_IN: Readonly<Record<string, "it" | "en">> = { "tutto-a-parole": "it", "parola-per-parola": "en" };
/** I trofei che una lingua mostra: trenta, ciascuna con la sua sfida. */
export const trofeiDellaLingua = (lingua: "it" | "en"): readonly Trofeo[] => TROFEI.filter((t) => (SOLO_IN[t.id] ?? lingua) === lingua);

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
  /** almeno un comando dato giocando in italiano (Parola per parola è una sfida dell'inglese) */
  italiano: boolean;
  /** almeno una strada che il testo nominava presa altrove (la rosa dei venti) invece che dalla parola del testo */
  fuoriTesto: boolean;
}

/** Un viaggio che comincia: nessuna sfida rotta. */
export const sfideNuove = (id: string): Sfide => ({ id, scritto: false, toccato: false, indietro: false, italiano: false, fuoriTesto: false });

/** Le sfide lette da un salvataggio. Un salvataggio senza (fino alla 1.29) o guasto: tutte rotte, perché di quella
 *  partita non si sa com'è andata (i trofei contano da questa versione in poi). */
export function pulisciSfide(x: unknown, idDiRiserva: string): Sfide {
  const d = (x && typeof x === "object" ? x : null) as Record<string, unknown> | null;
  if (!d || typeof d.id !== "string" || !/^[0-9a-z-]{4,40}$/.test(d.id)) return { id: idDiRiserva, scritto: true, toccato: true, indietro: true, italiano: true, fuoriTesto: true };
  // una sfida che il salvataggio non dice (italiano e fuoriTesto, fino alla 1.39) è rotta come una guasta
  const b = (v: unknown) => (typeof v === "boolean" ? v : true);
  return { id: d.id, scritto: b(d.scritto), toccato: b(d.toccato), indietro: b(d.indietro), italiano: b(d.italiano), fuoriTesto: b(d.fuoriTesto) };
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
// per la collezione le due sfide di una lingua sola valgono l'una l'altra
const TUTTI_GLI_ALTRI = TROFEI.map((t) => t.id).filter((id) => id !== "il-viaggiatore" && !SOLO_IN[id]);
const UNA_DELLE_DUE = Object.keys(SOLO_IN);

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
    // solo chi ha giocato tutto in inglese, e non ha mai preso altrove una strada che il testo nominava
    if (t.sfide.italiano === false && t.sfide.fuoriTesto === false) prendi("parola-per-parola");
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
  if (TUTTI_GLI_ALTRI.every(ha) && UNA_DELLE_DUE.some(ha)) prendi("il-viaggiatore");

  return TROFEI.map((x) => x.id).filter((id) => presi.has(id));
}
