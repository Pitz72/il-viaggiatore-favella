// ====================================================================
//  I volti dei personaggi e le tavole degli oggetti della memoria.
// --------------------------------------------------------------------
//  Le immagini stanno in public/immagini/ (le scrive strumenti/immagini.py dagli
//  originali, fuori da git): un ritratto tondo per ciascuno dei quattordici, due
//  varianti (Imma dopo aver mangiato, Pasquale guarito), otto oggetti.
//
//  Un volto si vede solo accanto a chi parla, cioè dopo averlo incontrato; il
//  protagonista non ha volto, né la sua famiglia. Un oggetto si vede quando il
//  testo lo descrive: le tavole si riconoscono dall'inizio della descrizione
//  che il motore stampa (la storia è definitiva, e il collaudo testo.py
//  controlla che ogni inizio stia nei .fav), così valgono anche nell'avventura
//  testuale, qualunque parola si scriva per esaminare.
// ====================================================================

// Assoluto, come la base di Pyodide (lib/favellaRuntime.ts): con `base: './'` un url() relativo dentro la variabile --volto
// si risolverebbe rispetto al foglio di stile (assets/), non alla pagina, e il volto delle risposte non si caricherebbe.
const BASE = new URL(`${import.meta.env.BASE_URL}immagini/`, document.baseURI).href;

/** Chi ha un ritratto: il nome come lo stampa il motore → il file. */
const VOLTI: Readonly<Record<string, string>> = {
  Nunzio: "nunzio", Saverio: "saverio", Iole: "iole", Rocco: "rocco", Vito: "vito", Imma: "imma", Rosaria: "rosaria",
  Peppe: "peppe", Ciro: "ciro", Pasquale: "pasquale", Concetta: "concetta", Tore: "tore", Onofrio: "onofrio", Cosimo: "cosimo",
};

/** Il ritratto di chi parla, nella sua variante di adesso (Imma dopo aver mangiato, Pasquale guarito); nullo per chi non ne ha. */
export function voltoDi(chi: string, stati?: Readonly<Record<string, string>>): string | null {
  const f = VOLTI[chi];
  if (!f) return null;
  if (f === "imma" && stati?.["stato di imma"] && stati["stato di imma"] !== "digiuna") return `${BASE}ritratti/imma-sfamata.webp`;
  if (f === "pasquale" && stati?.["stato di pasquale"] === "curato") return `${BASE}ritratti/pasquale-guarito.webp`;
  return `${BASE}ritratti/${f}.webp`;
}

/** Gli stati che cambiano un volto o una tavola: il diario ricorda, per ogni voce, solo questi (anche nei salvataggi). */
const STATI_DELLE_IMMAGINI = ["stato di imma", "stato di pasquale", "stato della foto"] as const;
export function statiDelleImmagini(stati?: Readonly<Record<string, string>>): Record<string, string> | undefined {
  return stati ? Object.fromEntries(STATI_DELLE_IMMAGINI.flatMap((k) => (typeof stati[k] === "string" ? [[k, stati[k]]] : []))) : undefined;
}

/** Gli oggetti illustrati e l'inizio della loro descrizione (prototipo/*.fav), come il motore la stampa. La foto ha anche il
 *  gesto: quando la raddrizzi, la tavola si raddrizza. */
export const TAVOLE: readonly { id: string; incipit: string }[] = [
  { id: "foto", incipit: "Marito, moglie e un bambino in braccio, in posa davanti alla fontana" },
  { id: "foto", incipit: "La raddrizzi con due dita." },
  { id: "biglietto", incipit: "L'ultimo biglietto arrivato da casa, consumato sulle pieghe." },
  { id: "tanica", incipit: "Una tanica da dieci litri, ammaccata ma a tenuta." },
  { id: "diario", incipit: "Il diario di chi ha fatto questa strada prima di te." },
  { id: "anello", incipit: "Una fede sottile, da donna." },
  { id: "giocattolo", incipit: "Un cavalluccio di legno intagliato a coltello" },
  { id: "santino", incipit: "Un santino di carta, la figura sbiadita" },
  { id: "lettera", incipit: "La lettera che Cosimo scrisse e non spedì mai." },
];

export interface Tavola { id: string; src: string; raddrizza: boolean }

/** La tavola di un pezzo di prosa, se ne descrive uno: l'oggetto, l'immagine e se è il gesto di raddrizzare la foto. */
export function tavolaDi(testo: string): Tavola | null {
  const t = testo.trimStart();
  const trovata = TAVOLE.find((v) => t.startsWith(v.incipit));
  return trovata ? { id: trovata.id, src: `${BASE}oggetti/${trovata.id}.webp`, raddrizza: trovata.incipit.startsWith("La raddrizzi") } : null;
}
