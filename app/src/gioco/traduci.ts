// ====================================================================
//  Il racconto in inglese: dal testo che il motore stampa alla sua traduzione.
// --------------------------------------------------------------------
//  Il motore e i .fav restano in italiano, e così il diario: le partite, i
//  salvataggi, la voce, i trofei, le tavole leggono l'italiano. Al momento di
//  mostrarlo, se la lingua è l'inglese, ogni blocco del diario si traduce.
//  Come il doppiaggio (parti.ts), il testo si riconosce DAL TESTO: i cataloghi
//  (lingue/en/*.json, strumenti/traduzione.py) dicono per ogni testo dei .fav
//  la sua versione inglese, e qui si ritrovano:
//    · un testo intero, tale e quale;
//    · un testo coi segnaposto ([acqua], [i fili del viaggio]): il valore
//      stampato si riprende e si rimette nella frase inglese (un numero com'è,
//      un nome tradotto, una fila di frasi tradotta a sua volta);
//    · una riga fatta di più testi (i posti delle cose, i fili del viaggio, due
//      testi sulla stessa riga): la fila più corta di testi noti che la rifà,
//      ai confini di frase;
//    · le risposte del motore (Preso:, Il tempo passa., …), che non stanno nei
//      .fav: una tabella di forme qui sotto.
//  Ciò che non si ritrova resta in italiano (il collaudo collaudo/traduzione.py
//  pretende che lungo i percorsi non succeda). I nomi di luoghi, cose e persone
//  (pulsanti, mappa, parole che si toccano) li dà nome().
//  Niente React; di runtime soltanto i cataloghi e testo.ts: il collaudo lo
//  prova in Node (app/scripts/traduci-node.mjs).
// ====================================================================
import storia from "../lingue/en/storia.json";
import sistemi from "../lingue/en/sistemi.json";
import z1 from "../lingue/en/z1.json";
import z2 from "../lingue/en/z2.json";
import z3 from "../lingue/en/z3.json";
import z4 from "../lingue/en/z4.json";
import z5 from "../lingue/en/z5.json";
import z6 from "../lingue/en/z6.json";
import z7 from "../lingue/en/z7.json";
import nomiEn from "../lingue/en/nomi.json";
import { analizza, spezza, type Blocco } from "./testo";

export interface VoceCatalogo { tipo: string; chi?: string; dove?: string; it: string; en: string }
export const CATALOGHI: Record<string, VoceCatalogo[]> = { storia, sistemi, z1, z2, z3, z4, z5, z6, z7 };
export const NOMI: Record<string, string> = nomiEn;

/** La forma con cui si confrontano i testi: tipografia raddrizzata, spazi singoli. */
export const norma = (t: string) =>
  t.normalize("NFC").replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\\n/g, "\n").replace(/[ \t]+/g, " ").trim();

/** Il testo inglese com'è scritto (le virgolette curve restano), con gli a capo veri e gli spazi singoli. */
const pulito = (t: string) => t.normalize("NFC").replace(/\\n/g, "\n").replace(/[ \t]+/g, " ").trim();

const CONDIZIONALI = /\[(se\b[^\]]*|altrimenti|fine)\]/;
const SEGNAPOSTO = /\[([^[\]]+)\]/g;
const CONFINE = /(?<=[.!?…:;)"»])\s+(?=[(«"A-ZÀ-Ý0-9])/;

// --------------------------------------------------------------------
//  I nomi
// --------------------------------------------------------------------
const DIREZIONI: Record<string, string> = { nord: "north", sud: "south", est: "east", ovest: "west", su: "up", "giù": "down", giu: "down" };
const ARTICOLO = /^(il|lo|la|i|gli|le|l'|un|uno|una|un')\s*/i;
const DETERMINATI = new Set(["il", "lo", "la", "i", "gli", "le", "l'"]);
const nomiBassi = new Map(Object.entries(NOMI).map(([k, v]) => [k.toLowerCase(), v]));
const maiuscola = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);

/** Il nome inglese di un luogo, di una cosa, di una persona o di una direzione, con l'articolo se l'italiano ce l'ha
 *  («la mappa» → «the map», «Un coltello» → «A knife», «nord» → «north»); com'era, se non si conosce. */
export function nome(it: string): string {
  const s = norma(it);
  const basso = s.toLowerCase();
  if (DIREZIONI[basso]) return s[0] === s[0].toUpperCase() ? maiuscola(DIREZIONI[basso]) : DIREZIONI[basso];
  const m = s.match(ARTICOLO);
  const art = m ? m[1].toLowerCase() : null;
  const nudo = m ? s.slice(m[0].length) : s;
  const en = nomiBassi.get(nudo.toLowerCase());
  if (en === undefined) return it;
  let out = en;
  if (art && DETERMINATI.has(art)) out = `the ${en}`;
  else if (art) out = /^[aeiou]/i.test(en) ? `an ${en}` : `a ${en}`;
  return s[0] === s[0].toUpperCase() && s[0] !== s[0].toLowerCase() ? maiuscola(out) : out;
}

/** Il nome senza articolo, in inglese: «la mappa» → «map». */
export const nomeNudo = (it: string) => nome(norma(it).replace(ARTICOLO, "")).replace(/^(the|an?)\s+/i, "");

// le parole in maiuscolo del testo inglese, rimesse in italiano: chi le tocca apre la cosa (o l'uscita) del motore
const inverso = new Map<string, string>();
for (const [it, en] of Object.entries(NOMI)) if (en) inverso.set(en.toLowerCase(), it.toLowerCase());
for (const [it, en] of Object.entries(DIREZIONI)) inverso.set(en, it);

/** Una parola che si tocca nel testo inglese («map», «north»), con il nome italiano che conoscono i pulsanti. */
export const chiaveItaliana = (en: string): string => inverso.get(en.toLowerCase()) ?? en.toLowerCase();

// --------------------------------------------------------------------
//  I cataloghi in tabelle
// --------------------------------------------------------------------
interface Modello { re: RegExp; nomi: string[]; en: string }
const esatti = new Map<string, string>();
const modelli: Modello[] = [];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function registra(it: string, en: string) {
  it = norma(it); en = pulito(en);
  if (!it || !en) return;
  // riga per riga: il diario divide le righe, e ogni riga del .fav si traduce per conto suo
  const ri = it.split("\n"), re_ = en.split("\n");
  if (ri.length > 1 && ri.length === re_.length) { ri.forEach((r, i) => registra(r, re_[i])); return; }
  // la frase di un finale: il diario la mostra senza «FINALE —» (testo.ts)
  const finale = /^FINALE\s*—\s*/;
  if (finale.test(it)) registra(it.replace(finale, ""), en.replace(/^(FINALE|ENDING)\s*—\s*/, ""));
  if (!it.includes("[")) { if (!esatti.has(it)) esatti.set(it, en); return; }
  // una riga fatta solo di segnaposto (i fili del viaggio, sulla loro riga) riconoscerebbe qualunque cosa: le sue frasi
  // si ritrovano una per una (i rami dei testi condizionali)
  if (!it.replace(SEGNAPOSTO, "").trim()) return;
  const nomi: string[] = [];
  const corpo = it.split(SEGNAPOSTO).map((p, i) => {
    if (i % 2 === 0) return escape(p);
    nomi.push(p.trim());
    return "\u0000";
  }).join("");
  // attorno a un segnaposto gli spazi possono mancare (un valore vuoto: niente fili)
  const re = new RegExp("^" + corpo.replace(/ ?\u0000 ?/g, " ?(.*?) ?") + "$", "s");
  modelli.push({ re, nomi, en });
}

/** I testi condizionali: ogni ramo è una frase che si ritrova da sola (i fili del viaggio), come il testo intorno. */
function rami(it: string, en: string): [string, string][] {
  const pezzi = (t: string) => t.split(/(\[(?:se\b[^\]]*|altrimenti|fine)\])/);
  const a = pezzi(it), b = pezzi(en);
  if (a.length !== b.length) return [];
  const out: [string, string][] = [];
  for (let i = 0; i < a.length; i += 2) if (a[i].trim()) out.push([a[i], b[i]]);
  return out;
}

for (const voci of Object.values(CATALOGHI)) {
  for (const v of voci) {
    if (!v.en) continue;
    if (CONDIZIONALI.test(v.it)) { for (const [it, en] of rami(v.it, v.en)) registra(it, en); }
    else registra(v.it, v.en);
  }
}

// --------------------------------------------------------------------
//  Le risposte del motore (non stanno nei .fav)
// --------------------------------------------------------------------
type Forma = [RegExp, (m: RegExpMatchArray) => string];
const FORME: Forma[] = [
  [/^Preso: (.+)\.$/, (m) => `Taken: ${nome(m[1])}.`],
  [/^Lasciato: (.+)\.$/, (m) => `Dropped: ${nome(m[1])}.`],
  [/^Stai portando: \((\d+)\/(\d+)\)$/, (m) => `You are carrying: (${m[1]}/${m[2]})`],
  [/^Stai portando:$/, () => "You are carrying:"],
  [/^- (.+)$/, (m) => `- ${maiuscola(nome(m[1]))}`],
  [/^Non stai portando (niente|nulla)\.?$/, () => "You are not carrying anything."],
  [/^Il tempo passa\.$/, () => "Time passes."],
  [/^\(Fine della conversazione\.\)$/, () => "(End of conversation.)"],
  [/^Concludi la conversazione\.$/, () => "End the conversation."],
  [/^\(La conversazione si chiude\.\)$/, () => "(The conversation ends.)"],
  [/^La partita è finita\.$/, () => "The game is over."],
  [/^Annullato[.:]?\s*(.*)$/, (m) => `Undone.${m[1] ? " " + m[1] : ""}`],
  [/^Non c'è niente da annullare\.$/, () => "There is nothing to undo."],
  [/^Ce l'hai già\.$/, () => "You already have it."],
  [/^Non succede nulla\.$/, () => "Nothing happens."],
  [/^Non senti niente di particolare\.$/, () => "You hear nothing in particular."],
  [/^Non vedi nulla di particolare\.$/, () => "You see nothing in particular."],
  [/^Usare (.+) su (.+) non ha alcun effetto particolare\.$/, (m) => `Using ${nome(m[1])} on ${nome(m[2])} has no particular effect.`],
  [/^Usare (.+) con (.+) non ha alcun effetto particolare\.$/, (m) => `Using ${nome(m[1])} with ${nome(m[2])} has no particular effect.`],
  [/^\(Hai annullato l'ultimo turno\.\)$/, () => "(You undid the last turn.)"],
  [/^Hai le mani troppo piene\b.*$/, () => "Your hands are too full."],
  [/^Qui non c'è nessuno\b.*$/, () => "There is nobody here."],
  [/^Non ce l'hai\.$/, () => "You don't have it."],
  [/^Non puoi prender(?:e|lo|la|li|le)\b.*$/, () => "You can't take that."],
  [/^Non (?:si apre|si chiude|si mangia|si beve|si può)\b.*$/, () => "You can't do that."],
  [/^Non vedo (.+) qui\.$/, (m) => `I don't see ${nome(m[1])} here.`],
  [/^Non capisco\b.*$/, () => "I don't understand."],
  [/^Vuoi davvero (.+)\? \((?:sì|si)\/no\)$/, () => "Are you sure? (yes/no)"],
  [/^A presto!$/, () => "Goodbye!"],
];

// --------------------------------------------------------------------
//  Il riconoscimento
// --------------------------------------------------------------------
/** Un valore stampato al posto di un segnaposto, in inglese: un numero com'è, un nome tradotto, una fila di frasi tradotta. */
function valore(v: string): string {
  if (!v.trim() || /^\d+$/.test(v.trim())) return v;
  const n = nome(v);
  if (n !== v) return n;
  return traduciTesto(v) ?? v;
}

function intero(t: string): string | null {
  const e = esatti.get(t);
  if (e !== undefined) return e;
  for (const m of modelli) {
    const r = t.match(m.re);
    if (!r) continue;
    let out = m.en;
    m.nomi.forEach((n, i) => { out = out.split(`[${n}]`).join(valore(r[i + 1] ?? "")); });
    return pulito(out);
  }
  for (const [re, f] of FORME) {
    const r = t.match(re);
    if (r) return f(r);
  }
  return null;
}

const memoria = new Map<string, string | null>();

/** Una riga del motore in inglese, o null se non la si ritrova. */
export function traduciTesto(testo: string): string | null {
  const t = norma(testo);
  if (!t) return testo;
  if (memoria.has(t)) return memoria.get(t)!;
  memoria.set(t, null);   // un valore che rimanda a sé stesso non si cerca all'infinito
  let r = intero(t);
  if (r === null) {
    // la fila più corta di testi noti che rifà la riga, ai confini di frase
    const pezzi = t.split(CONFINE);
    const n = pezzi.length;
    if (n > 1) {
      const meglio: (string[] | null)[] = Array(n + 1).fill(null);
      meglio[0] = [];
      for (let a = 0; a < n; a++) {
        if (!meglio[a]) continue;
        for (let b = n; b > a; b--) {
          if (b - a === n) continue;
          const e = intero(pezzi.slice(a, b).join(" "));
          if (e !== null && (!meglio[b] || meglio[b]!.length > meglio[a]!.length + 1)) meglio[b] = [...meglio[a]!, e];
        }
      }
      if (meglio[n]) r = meglio[n]!.join(" ");
    }
  }
  memoria.set(t, r);
  return r;
}

/** Come traduciTesto, ma senza null: ciò che non si ritrova resta com'è (in italiano). */
export const inInglese = (testo: string): string => traduciTesto(testo) ?? testo;

/** Un blocco del diario in inglese (i blocchi restano italiani: si traducono quando si mostrano). */
export function traduciBlocco(b: Blocco): Blocco {
  switch (b.tipo) {
    case "stanza": return { ...b, titolo: nome(b.titolo) };
    case "battuta": return { ...b, testo: inInglese(b.testo) };
    case "comando": return b;
    default: return { ...b, testo: inInglese(b.testo) };
  }
}

// --------------------------------------------------------------------
//  I comandi e le parole dell'interfaccia
// --------------------------------------------------------------------
//  azioni.ts compone in italiano (è la lingua del parser, e i collaudi la
//  provano così): le sue etichette, le domande delle conferme, le dosi e i
//  comandi che il diario ripete si traducono qui, quando si mostrano.
const VERBI: Record<string, string> = {
  esamina: "examine", guarda: "look", osserva: "examine", prendi: "take", raccogli: "take", lascia: "drop", posa: "drop",
  bevi: "drink", mangia: "eat", inventario: "inventory", stato: "status", aspetta: "wait", annulla: "undo",
  attacca: "attack", minaccia: "threaten", spara: "shoot", colpisci: "hit", attingi: "draw water", curati: "treat yourself",
  raddrizza: "straighten", "sì": "yes", si: "yes", no: "no",
};
const COMANDI_INTERI: Record<string, string> = {
  "bevi due sorsi": "drink two sips", "bevi tre sorsi": "drink three sips", "mangia qualcosa": "eat something",
  "mangia due porzioni": "eat two portions", "mangia tre porzioni": "eat three portions", "getta cibo": "throw food",
  "bevi salmastra": "drink brackish",
};

/** Un comando italiano (quello che il pulsante ha mandato, o la risposta scelta) come lo legge chi gioca in inglese. */
export function comandoInglese(cmd: string): string {
  const c = norma(cmd), b = c.toLowerCase();
  if (COMANDI_INTERI[b]) return COMANDI_INTERI[b];
  if (DIREZIONI[b]) return DIREZIONI[b];
  let m: RegExpMatchArray | null;
  if ((m = b.match(/^usa (.+?) su (.+)$/))) return `use ${nome(m[1])} on ${nome(m[2])}`;
  if ((m = b.match(/^dai (.+?) a (.+)$/))) return `give ${nome(m[1])} to ${nome(m[2])}`;
  if ((m = b.match(/^parla con (.+)$/))) return `talk to ${nome(m[1])}`;
  if ((m = b.match(/^(\S+)(?: (.+))?$/)) && VERBI[m[1]]) return m[2] ? `${VERBI[m[1]]} ${nome(m[2])}` : VERBI[m[1]];
  return traduciTesto(c) ?? cmd;   // una risposta di dialogo
}

const ETICHETTE: Record<string, string> = {
  "parla con": "talk to", esamina: "examine", prendi: "take", lascia: "drop", "bevi…": "drink…", "usa su…": "use on…",
  attacca: "attack", minaccia: "threaten", raddrizza: "straighten", Attingi: "Draw water", Curati: "Treat yourself",
  "Getta il cibo": "Throw the food", "Bevi l'acqua salmastra": "Drink the brackish water",
  "Un sorso": "One sip", "Due sorsi": "Two sips", "Tre sorsi": "Three sips",
  "Una porzione": "One portion", "Due porzioni": "Two portions", "Tre porzioni": "Three portions",
  "Vuoi bere?": "Drink?", "Vuoi mangiare?": "Eat?",
};
/** «sulla mappa» → «mappa»: il nome dentro il «su» articolato di conSu (azioni.ts). */
const dopoSu = (s: string) => s.replace(/^(?:su|sul|sullo|sulla|sui|sugli|sulle)\s+|^sull'/i, "");

/** Un'etichetta di azioni.ts (voci del menu di una cosa, gesti, dosi, titoli) in inglese. */
export function etichettaInglese(e: string): string {
  if (ETICHETTE[e]) return ETICHETTE[e];
  let m: RegExpMatchArray | null;
  if ((m = e.match(/^usa (.+) su…$/))) return `use ${nome(m[1])} on…`;
  if ((m = e.match(/^usa (su.*)…$/))) return `use on ${nome(dopoSu(m[1]))}…`;
  if ((m = e.match(/^(Attacca|Minaccia|Raddrizza) (.+)$/))) return `${maiuscola(VERBI[m[1].toLowerCase()])} ${nome(m[2])}`;
  return nome(e);
}

const PAROLE_DEL_CORPO: Record<string, string> = { sete: "thirst", fame: "hunger", acqua: "water", cibo: "food", vita: "life" };
/** Le scorte e il corpo in una riga di conti: «sete 8 → 0 · acqua 3 → 1», «2 d'acqua (ne entrano 1)». */
export function contiInglese(s: string): string {
  return s
    .replace(/(\d+) d'acqua/g, "$1 water").replace(/(\d+) di cibo/g, "$1 food").replace(/(\d+) di vita/g, "$1 life")
    .replace(/\(ne entrano (\d+)\)/g, "(only $1 fit)").replace(/\(non ne entra\)/g, "(none fits)")
    .replace(/\b(sete|fame|acqua|cibo|vita)\b/g, (w) => PAROLE_DEL_CORPO[w]);
}

const SEGNI: Record<string, string> = {
  "la fine": "the end", "una svolta": "a turning point", "la violenza costa": "violence costs", "ti fa male": "it hurts",
  "uno scambio": "a trade", "si dà qualcosa": "giving something away", "si perde qualcosa": "losing something",
};
const DOMANDE: Record<string, string> = {
  "Questa scelta chiude il viaggio. Vuoi procedere?": "This choice ends the journey. Go ahead?",
  "Questa scelta pesa sul resto del viaggio. Vuoi confermarla?": "This choice weighs on the rest of the journey. Confirm it?",
  "Vuoi davvero alzare le mani?": "Do you really want to raise a hand to someone?",
  "Ti costa vita. Vuoi farlo lo stesso?": "It costs you life. Do it anyway?",
  "Vuoi fare questo scambio?": "Make this trade?",
  "Vuoi davvero rinunciarci?": "Do you really want to give it up?",
};
const GESTI_DI_VIOLENZA: Record<string, string> = {
  attaccare: "attack", minacciare: "threaten", colpire: "hit", sparare: "shoot", uccidere: "kill", ammazzare: "kill",
  picchiare: "beat", aggredire: "assault",
};

/** Le parole di una conferma (azioni.ts, valutaConferma) in inglese. */
export function confermaInglese<C extends { segno: string; domanda: string; perdi: string[]; ottieni: string[]; pesa: string[]; spreco: string; dopo: string }>(c: C): C {
  let domanda = DOMANDE[c.domanda];
  let m: RegExpMatchArray | null;
  if (!domanda && (m = c.domanda.match(/^Vuoi davvero dare (.+)\?$/))) domanda = `Do you really want to give ${contiInglese(m[1]).replace(/ e /g, " and ")}?`;
  if (!domanda && (m = c.domanda.match(/^Vuoi davvero (attaccare|minacciare|colpire|sparare|uccidere|ammazzare|picchiare|aggredire)\s+(?:(?:a|al|allo|alla|ai|agli|alle)\s+|all')?(.+)\?$/))) {
    const chi = m[2];
    const persona = nome(/^(il|lo|la|i|gli|le|l')/i.test(chi) ? chi : chi);
    const daAr = /^(?:al|allo|alla|ai|agli|alle|all')/.test(c.domanda.slice(c.domanda.indexOf(m[1]) + m[1].length).trim());
    domanda = `Do you really want to ${GESTI_DI_VIOLENZA[m[1]]}${m[1] === "sparare" ? " at" : ""} ${daAr ? nome("il " + chi) : persona}?`;
  }
  const voce = (s: string) => { const n = nome(s); return n !== s ? n : contiInglese(s); };
  const spreco = c.spreco
    .replace(/La tanica è già piena \((\d+)\): quest'acqua andrebbe persa\./, "The jerrycan is already full ($1): this water would be lost.")
    .replace(/La tanica tiene (\d+): (\d+) d'acqua andrebbero persi\./, "The jerrycan holds $1: $2 water would be lost.")
    .replace(/Il cibo che entra è meno di quello che ricevi: (\d+) di cibo andrebbero persi\./, "You can carry less food than you'd get: $1 food would be lost.");
  return {
    ...c, segno: SEGNI[c.segno] ?? c.segno, domanda: domanda ?? c.domanda,
    perdi: c.perdi.map(voce), ottieni: c.ottieni.map(voce), pesa: c.pesa.map(contiInglese), spreco, dopo: contiInglese(c.dopo),
  };
}

// Le righe a lato dello schermo (testo.ts, GESTI e VOCI): che cosa hai fatto a chi, e che cosa si dice di te.
// collaudo/traduzione.py verifica che abbiano le stesse chiavi delle tabelle italiane.
export const GESTI_EN: Record<string, string> = {
  "Saverio:cibo": "you left him something to eat",
  "Iole:dono": "you left her something of yours",
  "Iole:pompa": "you tied the filter to her pump",
  "Vito:pagato": "you paid him for passage",
  "Vito:bluff": "you pointed an empty pistol at him",
  "Vito:terra": "you left him on the ground",
  "Rosaria:acqua": "you left her some water",
  "Onofrio:ricordo": "you showed him something of yours",
  "Imma:cibo": "you got her to eat",
  "Pasquale:cura": "you treated him with your medicine",
};
export const VOCI_EN: Record<string, string> = {
  "del sangue": "raise your hands to people",
  "della generosità": "leave something for those who stay",
  "del bluff": "pointed an empty pistol at the tollbooth",
};
export const gestoInglese = (k: string): string => GESTI_EN[k] ?? "";
export const vocediTeInglese = (k: string): string => VOCI_EN[k] ?? k;

// --------------------------------------------------------------------
//  Le strade che il testo nomina («Parola per parola», trofei.ts)
// --------------------------------------------------------------------
//  In inglese la sfida vuole che ogni strada nominata dal testo si prenda
//  toccando la sua parola (NORTH, BAR…), non la rosa dei venti; dove il testo
//  tace (la discesa, la salita, la sterrata) la rosa è la sola via. Il testo è
//  quello del luogo, come lo ridice «guarda».
const senzaArticolo = (s: string) => s.replace(/^(il|lo|la|i|gli|le|un|uno|una)\s+/i, "").replace(/^(l'|un')/i, "").toLowerCase();

/** Le parole da toccare di un testo del motore, mostrato in inglese, col nome italiano che conoscono i pulsanti. */
export const paroleDaToccare = (testo: string): string[] => analizza(testo).filter((b) => b.tipo === "prosa")
  .flatMap((b) => spezza(inInglese(b.testo)).filter((p) => p.k === "chiave").map((p) => chiaveItaliana(p.s.toLowerCase())));

/** Il testo, in inglese, nomina questa strada con una parola da toccare? Per la direzione o per il luogo dove porta. */
export function nominaLaStrada(testo: string, dir: string, verso: string): boolean {
  const parole = paroleDaToccare(testo);
  return parole.includes(dir) || parole.includes(senzaArticolo(verso));
}
